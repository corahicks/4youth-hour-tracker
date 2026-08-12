import supabase from '../db/supabase.js'

/**
 * Retrieves the logged-in user's schedule from the database.
 * Joins the institutions table to include the institution name.
 * Users can only access their own schedules.
 *
 * @param {Object} req - Express request object (requires req.user.id from JWT)
 * @param {Object} res - Express response object
 * @returns {200} schedules - array of schedule records
 * @returns {500} error - failed to fetch from database
 */

export const getMySchedule = async (req, res) => {
    const { data, error } = await supabase //await: pause here and wait for this to finish before moving the next line. async and await are used together to handle asynchronous operations in a more readable way. 
        .from('schedules')
        .select('*, institutions(name)') // joins institutions table to get the name of the institution
        .eq('user_id', req.user.id) // filters schedules by the logged in user's id. ownership check is done here

    if (error) {
        return res.status(500).json({ message: 'Error fetching schedule' });
    }

    return res.status(200).json({ schedules: data });
}

/**
 * Retrieves the full schedule for all staff.
 * Joins institutions and users tables to include names instead of IDs.
 * Accessible by any authenticated employee.
 *
 * @param {Object} req - Express request object (requires valid JWT)
 * @param {Object} res - Express response object
 * @returns {200} schedules - array of all schedule records with institution and user names
 * @returns {500} error - failed to fetch from database
 */
export const getFullSchedule = async (req, res) => {
    const { data, error } = await supabase
        .from('schedules')
        .select('*, institutions(name), users(name)') // joins institutions and users tables to get the name of the institution and user
    if (error) {
        return res.status(500).json({ message: 'Error fetching full schedule' });
    }
    return res.status(200).json({ schedules: data });
}

/**
 * Confirms attendance for a scheduled shift.
 * If attended is true, creates an approved worklog for the shift.
 * If attended is false, updates the schedule attendance to absent.
 *
 * @param {Object} req - Express request object
 * @param {number} req.body.schedule_id - ID of the schedule being confirmed
 * @param {boolean} req.body.attended - Whether the employee attended the shift
 * @param {Object} req.user - Authenticated user from JWT (requires req.user.id)
 * @param {Object} res - Express response object
 * @returns {200} worklog - the created worklog (if attended)
 * @returns {200} updatedSchedule - the updated schedule (if absent)
 * @returns {400} error - attendance already confirmed for this shift
 * @returns {400} error - studio shift, use submitExtraHours instead
 * @returns {404} error - schedule not found or not owned by user
 * @returns {500} error - database operation failed
 * 

 */

export const confirmAttendance = async (req, res) => {
    const { schedule_id, attended } = req.body; // 1. get schedule_id and attended from req.body
    const { data: schedule, error: scheduleError } = await supabase // verify the schedule exists and belongs to the logged-in user
        .from('schedules')
        .select('*')
        .eq('id', schedule_id)
        .single();

    if (scheduleError || !schedule || schedule.user_id !== req.user.id) { //checking for connection failure, schedule not found, or schedule not owned by user.
        return res.status(404).json({ message: 'Schedule not found or not owned by user' });
    }

    if (!schedule.pay_rate_id) { // if pay_rate_id is null, this is a studio shift and should not be logged as a worklog. Studio shifts do not have fixed hours, so employees should use the submit extra hours endpoint to log their time.
        return res.status(400).json({ 
            message: 'Studio shifts do not have fixed hours. Please use submit extra hours to log your time.' 
        });
}
    const { data: existingWorklog, error: worklogError } = await supabase // check if a worklog already exists for this schedule_id
        .from('worklogs')
        .select('*')
        .eq('schedule_id', schedule_id)
        .single();
    if (worklogError && worklogError.code !== 'PGRST116') { // PGRST116 is the error code for "No rows found"
        return res.status(500).json({ message: 'Error checking existing worklog' });
    }

    if (existingWorklog) { 
        return res.status(400).json({ message: 'Worklog already exists for this schedule' });
    }

    const { data: payPeriod, error: payPeriodError } = await supabase // look up the pay_period_id based on the schedule date
        .from('pay_periods')
        .select('*')
        .lte('start_date', schedule.date)
        .gte('end_date', schedule.date)
        .single();
    if (payPeriodError) {
        return res.status(500).json({ message: 'Error fetching pay period' });
    }

    if ( attended === true ) {
        const { data: worklog, error: worklogInsertError } = await supabase // insert a worklog with status 'approved'
            .from('worklogs')
            .insert({
                user_id: req.user.id,
                schedule_id: schedule_id,
                institution_id: schedule.institution_id,
                date: schedule.date,
                pay_period_id: payPeriod.id,
                status: 'approved'
            })
            .select('*') // returns the inserted row(s) after the insert operation
            .single();

        if (worklogInsertError) {
            return res.status(500).json({ message: 'Error inserting worklog' });
        }
        return res.status(201).json({ worklog }); // 201 Created
    } else {
        const { data: updatedSchedule, error: updateError } = await supabase // update schedule attendance to absent
            .from('schedules')
            .update({ attendance: 'absent' })
            .eq('id', schedule_id)
            .select('*')
            .single();

        if (updateError) {
            return res.status(500).json({ message: 'Error updating schedule attendance' });
        }
        return res.status(200).json({ updatedSchedule });
    }

}

/**
 * Submits extra hours outside of the assigned schedule for admin approval.
 * Creates a worklog with status pending until an admin approves or denies it.
 *
 * @param {Object} req - Express request object
 * @param {number} req.body.schedule_id - ID of the related schedule
 * @param {number} req.body.extra_hours - Number of extra hours worked (must be greater than 0)
 * @param {string} req.body.reasoning - Explanation for the extra hours
 * @param {number} req.body.institution_id - ID of the institution where extra hours were worked
 * @param {string} req.body.date - Date the extra hours occurred
 * @param {Object} req.user - Authenticated user from JWT (requires req.user.id)
 * @param {Object} res - Express response object
 * @returns {201} worklog - the created pending worklog
 * @returns {400} error - extra_hours must be greater than 0
 * @returns {404} error - schedule not found or not owned by user
 * @returns {500} error - database operation failed
 */
export const submitExtraHours = async (req, res) => {
    const { schedule_id, extra_hours, reasoning, institution_id, date } = req.body;
    if (!extra_hours || extra_hours <= 0) {
        return res.status(400).json({ message: 'Extra hours must be greater than 0' });
    }
    const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', schedule_id)
        .single();
        
    if (scheduleError || !schedule || schedule.user_id !== req.user.id) {
        return res.status(404).json({ message: 'Schedule not found or not owned by user' });
    }
    const { data: payPeriod, error: payPeriodError } = await supabase
        .from('pay_periods')
        .select('*')
        .lte('start_date', date)
        .gte('end_date', date)
        .single();
    if (payPeriodError) {
        return res.status(500).json({ message: 'Error fetching pay period' });
    }

    const { data: worklog, error: worklogInsertError } = await supabase // employees can only logged in "pending" status.
        .from('worklogs')
        .insert({
            user_id: req.user.id,
            schedule_id: schedule_id,
            institution_id: institution_id,
            date: date,
            pay_period_id: payPeriod.id,
            extra_hours: extra_hours,
            reasoning: reasoning,
            status: 'pending'
        })
        .select('*')
        .single();
        
    if (worklogInsertError) {
        return res.status(500).json({ message: 'Error inserting worklog' });
    }
    return res.status(201).json({ worklog });
}

/**
 * Retrieves all worklogs for the logged-in employee, ordered by most recent first.
 * Joins institutions and pay_periods tables for context.
 * Optionally filters by pay period using a query parameter.
 *
 * @param {Object} req - Express request object (requires req.user.id from JWT)
 * @param {number} [req.query.pay_period_id] - Optional pay period ID to filter results
 * @param {Object} res - Express response object
 * @returns {200} worklogs - array of worklog records
 * @returns {500} error - failed to fetch from database
 */
export const getMyWorklogs = async (req, res) => {  
    const {pay_period_id} = req.query; // req.query reads values from the URL after the ?.
    let query = supabase // using let instead of const because we need to modify the optional filter for pay_period_id. If pay_period_id is provided, we will add an additional filter to the query.
        .from('worklogs')
        .select('*, institutions(name), pay_periods(start_date, end_date)')
        .eq('user_id', req.user.id)
        .order('date', { ascending: false });

    if (pay_period_id) {
        query = query.eq('pay_period_id', pay_period_id); // if pay_period_id is provided, we will add an additional filter to the query.
    }
    
    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ message: 'Error fetching worklogs' });
    }

    return res.status(200).json({ worklogs: data });
}

/**
 * Returns the logged-in employee's worklogs for a specific pay period
 * along with their total approved extra hours for that period.
 * Note: total does not yet include scheduled paid hours — that will be
 * added when the admin PDF export is built.
 *
 * @param {Object} req - Express request object (requires req.user.id from JWT)
 * @param {number} req.query.pay_period_id - Required pay period ID to summarize
 * @param {Object} res - Express response object
 * @returns {200} worklogs, totalHours - worklogs and total approved extra hours
 * @returns {400} error - pay_period_id is required
 * @returns {500} error - failed to fetch from database
 */
export const getMyPayPeriodSummary = async (req, res) => {
    const { pay_period_id } = req.query;
    if (!pay_period_id) {
        return res.status(400).json({ message: 'pay_period_id query parameter is required' });
    }
    const query =  supabase
        .from('worklogs')
        .select('*, institutions(name), pay_periods(start_date, end_date)')
        .eq('pay_period_id', pay_period_id) //limits to the requested pay period
        .eq('user_id', req.user.id) // limits to the logged-in user
        .order('date', { ascending: false });


    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ message: 'Error fetching worklogs' });
    }

    // calculating only approved extra hours. 
    const approvedWorklogs = data.filter(w => w.status === 'approved')
    const totalHours = approvedWorklogs.reduce((sum, w) => sum + (w.extra_hours || 0), 0)


    return res.status(200).json({ worklogs: data, totalHours });
}