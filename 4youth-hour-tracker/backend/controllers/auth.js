import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../db/supabase.js'

export const login = async (req, res) => {
    const { email, password } = req.body; //extract email and password from request body
    const { data: user, error} = await supabase //look up user in supabase by email
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
    if (error || !user) {
        return res.status(401).json({ message: 'User not found' });
    }

    if (!(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); //generate a jwt with the user's id and role

    return res.status(200).json({ token }); //send the token back with 200 status 
}
