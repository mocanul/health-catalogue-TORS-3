import fs from "fs"
import path from "path"
import csv from "csv-parser"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type CsvRow = {
    Room: string
    Type: string
    "Side Rooms": string
}

async function main() {
    const rows: CsvRow[] = []

    const filePath = path.join(process.cwd(), "Book(Sheet1).csv")

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => rows.push(row as CsvRow))
            .on("end", () => resolve())
            .on("error", (err) => reject(err))
    })

    const data = rows.map((row) => ({
        name: row.Room?.trim(),
        type: row.Type?.trim(),
        side_rooms:
            row["Side Rooms"] && row["Side Rooms"].trim() !== ""
                ? Number(row["Side Rooms"])
                : null,
    }))

    // optional: remove invalid rows
    const validData = data.filter(
        (row) => row.name && row.type && (row.side_rooms === null || !Number.isNaN(row.side_rooms))
    )

    await prisma.room.createMany({
        data: validData,
    })

    console.log(`Imported ${validData.length} rooms successfully.`)
}

main()
    .catch((e) => {
        console.error("Import failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })