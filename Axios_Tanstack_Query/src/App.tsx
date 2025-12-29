import { useState } from "react";
import { PostList } from "./components/PostList";
import { CreatePostForm } from "./components/CreatePostForm";
import { PostDetail } from "./components/PostDetail";
import { UpdatePostForm } from "./components/UpdatePostForm";
import { QueryLifecycleDemo } from "./components/QueryLifecycleDemo";
import { PollingDemo } from "./components/PollingDemo";
import { InfiniteScrollDemo } from "./components/InfiniteScrollDemo";
import { PrefetchDemo } from "./components/PrefetchDemo";

function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [activeDemo, setActiveDemo] = useState<
    "basic" | "lifecycle" | "polling" | "infinite" | "prefetch"
  >("basic");

  return (
    <div className="app-container">
      <header>
        <h1>Axios + TanStack Query Comprehensive Demo</h1>
        <nav className="demo-nav">
          <button
            className={activeDemo === "basic" ? "active" : ""}
            onClick={() => setActiveDemo("basic")}
          >
            Basic CRUD
          </button>
          <button
            className={activeDemo === "lifecycle" ? "active" : ""}
            onClick={() => setActiveDemo("lifecycle")}
          >
            Query Lifecycle
          </button>
          <button
            className={activeDemo === "polling" ? "active" : ""}
            onClick={() => setActiveDemo("polling")}
          >
            Polling
          </button>
          <button
            className={activeDemo === "infinite" ? "active" : ""}
            onClick={() => setActiveDemo("infinite")}
          >
            Infinite Scroll
          </button>
          <button
            className={activeDemo === "prefetch" ? "active" : ""}
            onClick={() => setActiveDemo("prefetch")}
          >
            Prefetch
          </button>
        </nav>
      </header>
      <main>
        {activeDemo === "basic" && (
          <>
            <div className="actions">
              <button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? "Hide" : "Show"} Create Post Form
              </button>
              <button onClick={() => setShowUpdateForm(!showUpdateForm)}>
                {showUpdateForm ? "Hide" : "Show"} Update Form
              </button>
            </div>

            {showCreateForm && <CreatePostForm />}

            <div className="content-grid">
              <div className="left-column">
                <PostList />
              </div>

              <div className="right-column">
                <div className="post-detail-section">
                  <h3>Post Details</h3>
                  <input
                    type="number"
                    placeholder="Enter post ID"
                    onChange={(e) =>
                      setSelectedPostId(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                  />
                  {selectedPostId && <PostDetail postId={selectedPostId} />}
                </div>

                {showUpdateForm && selectedPostId && (
                  <UpdatePostForm postId={selectedPostId} />
                )}
              </div>
            </div>
          </>
        )}

        {activeDemo === "lifecycle" && (
          <div className="demo-section">
            <QueryLifecycleDemo postId={selectedPostId || 1} />
          </div>
        )}

        {activeDemo === "polling" && (
          <div className="demo-section">
            <PollingDemo />
          </div>
        )}

        {activeDemo === "infinite" && (
          <div className="demo-section">
            <InfiniteScrollDemo />
          </div>
        )}

        {activeDemo === "prefetch" && (
          <div className="demo-section">
            <PrefetchDemo />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
