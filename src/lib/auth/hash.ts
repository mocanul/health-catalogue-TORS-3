import bcrypt from "bcrypt"

//number of iterations bcrypt will run to hash password
const iterations = 12

//function which returns hashed password
//used for login and account creation
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, iterations) //returns hashed password
}

//bcrypt hashes plain password inputed by user
//compares it against hashed password existing in database and validates it
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash) //returns true or false
}