import type { User } from "../types/workout";


type ProfileBarProps = {
  user: User;
  onSwitchProfile: () => void;
};


function ProfileBar({
  user,
  onSwitchProfile,
}: ProfileBarProps) {
  return (
    <div className="account-bar">

      <div className="account-info">

        <strong>
          {user.name}
        </strong>

        <span>
          {user.email}
        </span>

      </div>


      <button
        type="button"
        onClick={onSwitchProfile}
      >
        Switch Profile
      </button>

    </div>
  );
}


export default ProfileBar;