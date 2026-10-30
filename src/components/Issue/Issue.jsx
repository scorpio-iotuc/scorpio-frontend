import './Issue.css';

export default function Issue() {
    return (
        <div className="issue">
            <img src="/images/uups/uups.png" alt="Error" />
            <h2>Oops! An internal server error occurred.</h2>
            <section>
            <p>We are working to resolve the issue as quickly as possible.</p>
            <p>If the problem persists, please contact our support team.</p>
            {/* mail to */}
            <a>scorpioiotuc [at] gmail [dot] com</a>
            </section>
        </div>
    )
}