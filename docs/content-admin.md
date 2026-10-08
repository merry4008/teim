# 트임 콘텐츠 관리

주소: https://teim.merry4008.workers.dev/admin/

## 최초 로그인 설정

1. https://github.com/settings/applications/new 에서 OAuth App을 생성합니다.
   - 이름: TEUM Content Manager
   - Homepage URL: https://teim.merry4008.workers.dev
   - Authorization callback URL: https://teim.merry4008.workers.dev/api/cms/callback
2. Cloudflare → Workers & Pages → teim → Settings → Variables and Secrets:
   - `CMS_GITHUB_CLIENT_ID`: 발급된 Client ID
   - `CMS_GITHUB_CLIENT_SECRET`: 발급된 Client secret. **Secret 유형**으로 입력합니다.
3. 변경사항을 배포한 후 `/admin/`을 새로고침합니다.
4. merry4008/teim 저장소의 push 권한이 있는 GitHub 계정으로 로그인합니다.

CMS는 공개 저장소 편집에 필요한 GitHub OAuth `public_repo` 권한을 요청합니다. OAuth 권한 범위는 특정 저장소 하나로 제한되지 않습니다. 이 서버는 트임 저장소 push 권한을 확인한 후 로그인 결과를 전달합니다.

## 사용

- 홈 배너·이미지 → 홈페이지 이미지와 문구 → 배너별 이미지 업로드 및 문구 수정
- 매거진 글 관리 → 매거진 글 목록 → 글 목록에서 항목 추가/편집
- 이미지: JPG, PNG, WebP, GIF. 배너는 오른쪽 그림 영역에 들어갑니다.
- 본문은 일반 텍스트·줄바꿈 방식입니다.
- 임시 저장 → 검토 상태 변경 → 발행하면 GitHub main에 반영되어 Cloudflare가 배포합니다. 배포 완료 후 새로고침하면 반영됩니다.
- 이미지가 빈 배너는 기존 그림을 유지합니다. 제목·문구의 빈 값도 기존 내용을 유지합니다.
- '홈페이지 노출'을 끄면 방문자 목록에서 숨깁니다. 공개 GitHub 저장소이므로 임시저장/숨김 글과 업로드 파일도 저장소에서 공개될 수 있습니다. 비공개 정보는 입력하지 마세요.
- 로그인 비밀키는 GitHub 파일이나 채팅에 올리지 않습니다.

## 구성

Decap CMS 3.16.3, GitHub backend, editorial workflow.
글/배너는 `public/content/*.json`, 이미지는 `public/uploads/`에 저장됩니다.
로그인 설정이 없으면 편집기를 활성화하지 않고 초기 설정 안내를 표시합니다.
