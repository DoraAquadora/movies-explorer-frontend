import { useState, useEffect } from 'react'
import {
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import { CurrentUserContext } from '../contexts/CurrentUserContext'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import Main from '../Main/Main'
import Movies from '../Movies/Movies'
import SavedMovies from '../SavedMovies/SavedMovies'
import Profile from '../Profile/Profile'
import Register from '../Register/Register'
import Login from '../Login/Login'
import Page404 from '../NotFound/NotFound'
import Navigation from '../Navigation/Navigation'
import ProtectedRouteElement from '../ProtectedRoute/ProtectedRoute'
import Preloader from '../Preloader/Preloader'
import MainApi from '../../utils/MainApi'
import { BASE_URL } from '../../utils/constants'
import { auth } from '../../utils/auth'
import './App.css'

function App() {

  const [menuActive, setMenuActive] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)//false
  const [currentUser, setCurrentUser] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [savedMovies, setSavedMovies] = useState([])
  const [error, setError] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [msg, setMsg] = useState(false)
  const location = useLocation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const mainApi = new MainApi({
    url: BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  useEffect(() => {
    setError(false)
    setMsg(false)
    setErrMsg('')
  }, [location])

  useEffect(() => {
    handleCheckToken()
    /* eslint-disable-next-line */
  }, [])

  const handleCheckToken = () => {
    const jwt = localStorage.getItem('jwt')
    if (jwt) {
      setIsLoading(true)
      auth
        .checkToken(jwt)
        .then((data) => {
          if (data) {
            setIsLoggedIn(true)
            if (pathname === '/signin' || pathname === '/signup') {
              navigate('/movies', { replace: true })
            } else {
              navigate({ pathname }, { replace: true })
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => setIsLoading(false))
    }
  }

  useEffect(() => {
    isLoggedIn &&
      mainApi
        .getUserInfo()
        .then((user) => {
          setCurrentUser(user)
        })
        .catch((error) => console.log(error))
        /* eslint-disable-next-line */
  }, [isLoggedIn])

  const handleLogin = (email, password) => {
    if (!email || !password) {
      return
    }
    setIsLoading(true)
    auth
      .login(email, password)
      .then((res) => {
        if (res.token) {
          localStorage.setItem('jwt', res.token)
          setIsLoggedIn(true)
          navigate('/movies', { replace: true })
        }
      })
      .catch((error) => {
        setError(true)
        setErrMsg(error)
      })
      .finally(() => setIsLoading(false))
  }

  const handleRegister = (name, email, password) => {
    setIsLoading(true)
    auth
      .register(name, email, password)
      .then((res) => {
        setError(false)
        handleLogin(email, password)
      })
      .catch((error) => {
        setError(true)
        setErrMsg(error)
        console.log(error)
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangeUser = (data) => {
    mainApi
      .changeUserInfo(data)
      .then((user) => {
        setError(false)
        setCurrentUser(user)
        setMsg(true)
      })
      .catch((error) => {
        console.log(error)
        setMsg(false)
        setError(true)
      })
  }

  const handleSignOut = () => {
    setSavedMovies([])
    setIsLoggedIn(false)
    localStorage.clear()
    navigate('/', { replace: true })
  }

  const handleLikeMovie = (movie, isLiked, id) => {
    if (isLiked) {
      mainApi.deleteMovie(id).then((res) => {
        const updatedFilteredMovies = savedMovies.filter(
          (movie) => movie._id !== id
        )
        setSavedMovies(updatedFilteredMovies)
      })
    } else {
      mainApi
        .saveMovie(movie)
        .then((res) => {
          setSavedMovies([...savedMovies, res])
        })
        .catch((error) => console.log(error))
    }
  }



  useEffect(() => {
    isLoggedIn &&
      localStorage.setItem('savedMovies', JSON.stringify(savedMovies))
  }, [savedMovies, isLoggedIn])

  return (
    <CurrentUserContext.Provider value={{ currentUser }}>
      
      {isLoading ? (
        <Preloader />
      ) : (
        <div className="app">
          {pathname === '/' ||
          pathname === '/movies' ||
          pathname === '/saved-movies' ||
          pathname === '/profile' ? (
            <Header
            loggedIn={isLoggedIn}
              menuActive={menuActive}
              setMenuActive={setMenuActive}
            />
          ) : (
            ''
          )}
          <Routes>
            <Route path="/" element={<Main />} />
            <Route
              path="/movies"
              element={
                <ProtectedRouteElement
                  element={Movies}
                  isLoggedIn={isLoggedIn}
                  onLikeMovie={handleLikeMovie}
                  setSavedMovies={setSavedMovies}
                  savedMovies={savedMovies}
                />
              }
            />
            <Route
              path="/saved-movies"
              element={
                <ProtectedRouteElement
                  element={SavedMovies}
                  isLoggedIn={isLoggedIn}
                  savedMovies={savedMovies}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRouteElement
                  element={Profile}
                  onSignOut={handleSignOut}
                  isLoggedIn={isLoggedIn}
                  onChangeUserInfo={handleChangeUser}
                  msg={msg}
                  error={error}
                  setMsg={setMsg}
                />
              }
            />
            <Route
              path="/signup"
              element={
                isLoggedIn ? (
                  <Navigate to="/movies" />
                ) : (
                  <Register
                    error={error}
                    errMsg={errMsg}
                    onRegister={handleRegister}
                  />
                )
              }
            />
            <Route
              path="/signin"
              element={
                isLoggedIn ? (
                  <Navigate to="/movies" />
                ) : (
                  <Login error={error} errMsg={errMsg} onLogin={handleLogin} />
                )
              }
            />
            <Route path="*" element={<Page404 />} />
          </Routes>
          <Navigation
            active={menuActive}
            setActive={setMenuActive}

          />
          {pathname === '/' ||
          pathname === '/movies' ||
          pathname === '/saved-movies' ? (
            <Footer />
          ) : (
            ''
          )}
        </div>
      )}

    </CurrentUserContext.Provider>
  )
}

export default App;