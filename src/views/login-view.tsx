'use client'
import styles from "../views/login.module.css";
import {
  PropsWithChildren,
  MouseEventHandler
} from "react";
const LoginView = ({
  onClick,
  setBearerToken
}:PropsWithChildren<{
  onClick:MouseEventHandler<HTMLButtonElement>,
  setBearerToken: React.Dispatch<React.SetStateAction<string>>
}>) => {
  const handleChange = (event:any) => {
    const newValue = event.target.value;
    setBearerToken(newValue)
  };

  return (
    <div className={styles.container}>
      <div className={styles.login}>
        <form   className={styles.login_form}>
          <div className={styles.login_logo}></div>
          <table>
            <tbody>
            <tr>
              <td>
                <label itemType="name" title="Login:" className={styles.label}>
                  User name:
                </label>
              </td>
              <td>
                <input
                  className={`form-control ${styles.form_control}`}
                  id="username"
                  name="username"
                  type="text"

                  />
              </td>
            </tr>
            <tr>
              <td>
                <label itemType="name" title="Login:" className={styles.label}>
                  Password:
                </label>
              </td>
              <td>
                <input
                  className={`form-control ${styles.form_control}`}
                  id="password"
                  name="password"
                  type="password"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label itemType="name" title="Login:" className={styles.label}>
                bearerAuth  (http, Bearer)
                :
                </label>
              </td>
              <td>
                <input
                  className={`form-control ${styles.form_control}`}
                  id="token"
                  name="token"
                  type="text"
                  onChange={handleChange} 
                />
              </td>
            </tr>
            </tbody>
          </table>
          <button
          onClick={onClick}
            className={`btn btn-primary my-4 ${styles.btn} ${styles.btn_primary} ${styles.btn_login}`}
            type="submit"
            value="enter"
          >
            ENTER
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
