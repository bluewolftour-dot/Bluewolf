export const CMS_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export function resolveUploadErrorMessage(code: string): string {
    switch (code) {
        case "FILE_TOO_LARGE":
            return "파일이 너무 큽니다. 4MB 이하의 이미지를 업로드해주세요. (TinyPNG 등으로 압축하거나 WebP로 변환 후 다시 시도해 주세요.)";
        case "INVALID_IMAGE_CONTENT":
            return "이미지 파일이 손상되었거나 PNG/JPG/WEBP 형식이 아닙니다. 다른 파일로 다시 시도해주세요.";
        case "UNSUPPORTED_FILE_TYPE":
            return "JPG, PNG, WEBP 형식만 업로드할 수 있습니다.";
        case "INVALID_UPLOAD_NAME":
            return "업로드 이름을 확인해주세요.";
        case "SUPABASE_UPLOAD_FAILED":
            return "이미지 저장소 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.";
        case "ADMIN_REQUIRED":
            return "관리자 로그인 후 다시 시도해주세요.";
        case "INVALID_UPLOAD":
        case "INVALID_SLOT":
            return "잘못된 업로드 요청입니다. 페이지를 새로고침한 뒤 다시 시도해주세요.";
        default:
            return "이미지 업로드에 실패했습니다. JPG, PNG, WEBP 4MB 이하 파일인지 확인 후 다시 시도해주세요.";
    }
}
