import Form from '../Form/Form';

function Register() {
  return (
    <Form
      title="Добро пожаловать!"
      buttonText="Зарегистрироваться"
      text="Уже зарегистрированы?"
      routText=" Войти"
      rout="/signin">
      <label className="form__placeholder">
        Имя
        <input
          name="name"
          placeholder='имя'
          className="form__input"
          id="name"
          type="text"
          minLength="2"
          maxLength="40"
          required
        />
      </label>
      <label className="form__placeholder" htmlFor="email-input">
        E-mail
        <input 
        name="email"
        placeholder='email'
        className="form__input" 
        id="email" 
        type="email" 
        required />
      </label>
      <label className="form__placeholder">
        Пароль
        <input 
        name="password"
        placeholder='Пароль'
        className="form__input" 
        id="password" 
        type="password"
        minLength="2"
        maxLength="40"
        required />
        <span className="form__input-error">Что-то пошло не так...</span>
      </label>
    </Form>
  );
}

export default Register;