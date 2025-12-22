import { useAppSelector } from "./hooks/redux";
import { selectIsAuthenticated } from "./selectors";

import Todo from "./components/Todo";
import Header from "./components/Header";
import Auth from "./components/Auth";
import UserProfile from "./components/UserProfile";

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <>
      <Header />
      {isAuthenticated ? <UserProfile /> : <Auth />}
      {isAuthenticated && <Todo />}
    </>
  );
}

export default App;

