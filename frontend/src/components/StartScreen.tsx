import { useState } from "react";
import type { FormEvent } from "react";

import type { User } from "../types/workout";




type StartScreenProps = {
  onUserReady: (user: User) => void;
};


function StartScreen({
  onUserReady,
}: StartScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/account/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to continue."
        );
      }

      onUserReady(data.user);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="start-screen">

      <section className="start-card">

        <h1>Personalized Workout App</h1>

        <p>
          Tell us who you are to create or access
          your workout profile.
        </p>


        <form
          className="start-form"
          onSubmit={handleSubmit}
        >

          <label>
            Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your name"
              required
            />
          </label>


          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </label>


          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Loading profile..."
              : "Continue"}
          </button>

        </form>


        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </section>

    </main>
  );
}


export default StartScreen;