import supabase from '../db/supabase.js'
import bcrypt from 'bcryptjs'

// ── User Management ──────────────────────────────────────────────

/**
 * Creates a new user account.
 *
 * @param {Object} req.body - name, email, password, role, hourly_rate
 * @returns {201} user - the created user
 * @returns {500} error - database operation failed
 */
export const createUser = async (req, res) => {
    const { name, email, password, role, hourly_rate } = req.body;
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, password_hash, role, hourly_rate }])
        .select('id, name, email, role, hourly_rate')
        .single();

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(201).json(data);
}

/**
 * Retrieves all user accounts.
 *
 * @returns {200} users - array of all users
 * @returns {500} error - database operation failed
 */
export const getAllUsers = async (req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, hourly_rate');

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);
}

/**
 * Updates an existing user account.
 *
 * @param {number} req.params.id - ID of the user to update
 * @param {Object} req.body - fields to update (name, email, role, hourly_rate)
 * @returns {200} user - the updated user
 * @returns {404} error - user not found
 * @returns {500} error - database operation failed
 */
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, hourly_rate } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (hourly_rate !== undefined) updates.hourly_rate = hourly_rate;

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, name, email, role, hourly_rate')
        .single();

    if (error?.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found' });
    }

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);
}

/**
 * Deletes a user account.
 *
 * @param {number} req.params.id - ID of the user to delete
 * @returns {200} message - success confirmation
 * @returns {404} error - user not found
 * @returns {500} error - database operation failed
 */
export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .select()
        .single();

    if (error?.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found' });
    }

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
}

// ── Schedule Management ──────────────────────────────────────────

/**
 * Creates a new schedule and assigns it to an employee.
 *
 * @param {Object} req.body - user_id, institution_id, pay_rate_id, date, season, attendance
 * @returns {201} schedule - the created schedule
 * @returns {500} error - database operation failed
 */
export const createSchedule = async (req, res) => {
    const { user_id, institution_id, pay_rate_id, date, start_time, end_time, season, attendance } = req.body;
    const { data, error } = await supabase
        .from('schedules')
        .insert([{ user_id, institution_id, pay_rate_id, date, start_time, end_time, season, attendance }])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ message: 'Database operation failed', error: error.message, details: error.details  });
    }

    return res.status(201).json(data); // 201 created
}

/**
 * Retrieves all schedules across all employees.
 *
 * @returns {200} schedules - array of all schedules with institution and user names
 * @returns {500} error - database operation failed
 */
export const getAllSchedules = async (req, res) => {
    const { data, error } = await supabase // query all rows from schedules table, join institutions(name) and users(name)
        .from('schedules')
        .select(`
            *,
            institutions(name),
            users(name)
        `);

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);

}

/**
 * Updates an existing schedule.
 *
 * @param {number} req.params.id - ID of the schedule to update
 * @param {Object} req.body - fields to update
 * @returns {200} schedule - the updated schedule
 * @returns {404} error - schedule not found
 * @returns {500} error - database operation failed
 */
export const updateSchedule = async (req, res) => {
    const scheduleId = req.params.id;
    const { user_id, institution_id, pay_rate_id, date, season, attendance } = req.body;
   
    const updates = {}
    if (user_id !== undefined) updates.user_id = user_id;
    if (institution_id !== undefined) updates.institution_id = institution_id;
    if (pay_rate_id !== undefined) updates.pay_rate_id = pay_rate_id;
    if (date !== undefined) updates.date = date;
    if (season !== undefined) updates.season = season;
    if (attendance !== undefined) updates.attendance = attendance;

    const { data, error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', scheduleId)
        .select()
        .single();

    if (error?.code === 'PGRST116') {
        return res.status(404).json({ message: 'Schedule not found' });
    }

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);
}

/**
 * Deletes a schedule.
 *
 * @param {number} req.params.id - ID of the schedule to delete
 * @returns {200} message - success confirmation
 * @returns {404} error - schedule not found
 * @returns {500} error - database operation failed
 */
export const deleteSchedule = async (req, res) => {
    const scheduleId = req.params.id;

    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)
        .select()
        .single();

    if (error?.code === 'PGRST116') {
        return res.status(404).json({ message: 'Schedule not found' });
    }

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json({ message: 'Schedule deleted successfully' });
}


// ── Worklog Management ───────────────────────────────────────────

/**
 * Retrieves all worklogs across all employees.
 *
 * @returns {200} worklogs - array of all worklogs with user and institution names
 * @returns {500} error - database operation failed
 */
export const getAllWorklogs = async (req, res) => {
    const { data, error } = await supabase //query all rows from worklogs table, join users(name) and institutions(name)
        .from('worklogs')
        .select(`
            *,
            users(name),
            institutions(name)
        `);

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);

}

/**
 * Updates the status of a pending extra hours worklog to approved or denied.
 *
 * @param {number} req.params.id - ID of the worklog to update
 * @param {string} req.body.status - new status: 'approved' or 'denied'
 * @returns {200} worklog - the updated worklog
 * @returns {400} error - invalid status value
 * @returns {404} error - worklog not found
 * @returns {500} error - database operation failed
 */
export const updateWorklogStatus = async (req, res) => {
    const worklogId = req.params.id;
    const { status } = req.body;

    if (!['approved', 'denied'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be "approved" or "denied".' });
    }

    const { data, error } = await supabase
        .from('worklogs')
        .update({ status })
        .eq('id', worklogId)
        .select()
        .single();

    if (error?.code === 'PGRST116') {
        return res.status(404).json({ message: 'Worklog not found' });
    }

    if (error) {
        return res.status(500).json({ message: 'Database operation failed' });
    }

    return res.status(200).json(data);
}

// ── Pay Period Export ────────────────────────────────────────────

/**
 * Exports a pay period summary as a PDF.
 * Placeholder — PDF generation not yet implemented.
 *
 * @param {number} req.params.id - ID of the pay period to export
 * @returns {501} message - not yet implemented
 */
export const exportPayPeriodPDF = async (req, res) => {
    return res.status(501).json({ message: 'PDF export not yet implemented' })
}
