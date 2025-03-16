import { getFile } from "@/actions/file";
import { getUserInfo } from "@/actions/user";
import { getSignedFileUrl } from "@/utils/s3";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const user = await getUserInfo(false);
        
        if (!user) {
            return Response.json({ error: '로그인이 필요합니다' }, { status: 401 });
        }

        const file = await getFile(id);

        if (!file) {
            return Response.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 });
        }

        const signedUrl = await getSignedFileUrl(file.s3_file_key);
        const url = new URL(signedUrl);

        return Response.redirect(url.toString());
    } catch (error) {
        console.error('파일 다운로드 중 오류:', error);
        return Response.json(
            { error: '파일 다운로드 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}