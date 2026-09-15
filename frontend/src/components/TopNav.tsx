import type {
  User,
} from "../types/workout";


type TopNavProps = {
  user: User;
};


function TopNav({
  user,
}: TopNavProps) {
  const firstLetter =
    user.name
      .charAt(0)
      .toUpperCase();


  return (
    <nav className="top-nav">

      <a
        className="top-nav-brand"
        href="#"
      >
        Adaptix<span>.</span>
      </a>


      <div className="top-nav-links">

        <a href="#build">
          Build
        </a>

        <a href="#programs">
          Programs
        </a>

        <a href="#history">
          History
        </a>

        <a href="#records">
          Records
        </a>

      </div>


      <div className="top-nav-user">

        <span className="nav-avatar">
          {firstLetter}
        </span>

        <span>
          {user.name}
        </span>

      </div>

    </nav>
  );
}


export default TopNav;