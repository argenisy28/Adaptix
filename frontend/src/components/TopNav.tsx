import WeightUnitToggle from "./WeightUnitToggle";

import type {
  User,
  WeightUnit,
} from "../types/workout";


type TopNavProps = {
  user: User;

  weightUnit: WeightUnit;

  onWeightUnitChange: (
    unit: WeightUnit
  ) => void;
};


function TopNav({
  user,
  weightUnit,
  onWeightUnitChange,
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
        Adaptix
      </a>


      <div className="top-nav-links">

        <a href="#dashboard">
          Dashboard
        </a>

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

        <WeightUnitToggle
          weightUnit={
            weightUnit
          }
          onChange={
            onWeightUnitChange
          }
        />


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