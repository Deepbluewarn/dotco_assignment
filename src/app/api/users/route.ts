import { getUserInfo, getUsersByRole } from "@/actions/user";
import { IRole } from "@/interfaces/user";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');

    if (role) {
        const users = await getUsersByRole((role as IRole), true);
        return Response.json({ success: true, data: users });
    }
    
    const user = await getUserInfo(true);
    return Response.json({ success: true, data: [user] });
}