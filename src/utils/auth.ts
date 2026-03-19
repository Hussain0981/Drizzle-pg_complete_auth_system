import bcrypt from 'bcrypt'

export const otp = Math.floor(1000 + Math.random() * 9000)

// hash convert
export const hashed = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

//  hash compare
export const comparePassword = async(hash: string, password:string) : Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
}
