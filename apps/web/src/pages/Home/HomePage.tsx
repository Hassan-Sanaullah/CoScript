import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
// import { Card } from "react-bootstrap";
// import Background from "./components/Background";
import { useEffect } from "react";

function HomePage() {

    useEffect(() => {
        // Add a class to the <body> when this page is loaded
        document.body.className = 'home-page';
        
        // Cleanup: Remove the class when the component is unmounted
        return () => {
          document.body.className = '';
        };
      }, []);


    return (
        <div className="main-homePage">
            <Navbar />

            {/* <Background /> */}
            <div className="main-content">
                <Card className="card1">
                    <h1>
                        Code Together, <br />
                        Build Faster.
                    </h1>
                    <h3>
                        Collaborate in real-time with developers from around the
                        world. No setup, just code.
                    </h3>
                    <button className="signupPage-button" type="button">Sign up now</button>
                </Card>

                <Card className="card2">
                    <h1>Collaborate in Real-Time</h1>
                    <h3>
                        With our platform, coding is no longer a solo activity.
                        Work on projects, debug code, and brainstorm solutions
                        together with teammates, all in real-time. Whether
                        you're tackling a problem or building something new,
                        seamless collaboration has never been easier. Join now
                        and experience the power of live, interactive coding!
                    </h3>
                </Card>

                <div className="section">
                    <Card className="card3">
                        <h3>Seamless Syncing</h3>Instantly Updated, Every Time
                        No need to refresh. Every keystroke is instantly synced
                        across all users' screens, ensuring you’re always on the
                        same page.
                    </Card>
                    <Card className="card3">
                        <h3>Code Sharing Made Easy</h3>Share Your Work in One
                        Click Share your live session or export your code
                        effortlessly with a simple click. Collaboration is made
                        simple and effective.
                    </Card>
                    <Card className="card3">
                        <h3>Real-Time Feedback</h3>Instant Code Review Get
                        feedback from your team in real-time. Comment, suggest
                        changes, or review code while you work, streamlining the
                        development process.
                    </Card>
                </div>
            </div>
                <footer className="home-footer">
                    <p>© CoScript </p>
                    <p>All Rights Reserved</p>
                </footer>
        </div>
    );
}

export default HomePage;
