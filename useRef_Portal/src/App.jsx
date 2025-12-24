import Player from "./components/Player.jsx";
import TimeChallenge from "./components/TimeChallenge.jsx";

function App() {
  return (
    <>
      <Player />
      <div id="challenges">
        <TimeChallenge title="Easy" targetime={1} />
        <TimeChallenge title="Not easy" targetime={5} />
        <TimeChallenge title="Getting tough" targetime={10} />
        <TimeChallenge title="Pros only" targetime={15} />
      </div>
    </>
  );
}

export default App;
