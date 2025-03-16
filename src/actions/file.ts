'use server'

import { IRequestFile } from "@/interfaces/request"
import { executeQuery } from "@/utils/db"

export async function getFile(file_id: string) {
    const file = await executeQuery<IRequestFile[]>(
        'SELECT * FROM files WHERE file_id = (?)',
        [file_id]
    );

    return file[0];
}