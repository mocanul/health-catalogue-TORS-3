import bcrypt from "bcrypt"

async function run() {
    const hash = await bcrypt.hash("password", 12)
    console.log(hash)
}

run()
