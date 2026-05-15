import * as tg from "./backend/telegram.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

async function runLogin() {
  console.log("-----------------------------------------");
  console.log("텔레그램(gramjs) 로그인 도우미를 시작합니다.");
  console.log("-----------------------------------------");
  
  try {
    await tg.connect();
    console.log("\n[성공] 로그인이 완료되었습니다!");
    console.log("아래의 긴 세션 문자열을 복사해서 Render의 SESSION_DATA에 넣어주세요:");
    console.log("-----------------------------------------");
    // telegram.js 내부에서 이미 로그를 찍도록 되어있습니다.
  } catch (e) {
    console.error("\n[오류] 로그인 중 문제가 발생했습니다:", e.message);
  }
}

runLogin();
