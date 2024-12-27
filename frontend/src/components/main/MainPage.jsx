
import { Link } from "react-router-dom";

export default function MainPage() {
  return (
    <div>
      <div>
        <h1>Main Page</h1>

          <Link to="/login">로그인</Link>
          <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
}