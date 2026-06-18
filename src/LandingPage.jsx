function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-navbar navbar navbar-expand-lg navbar-dark py-3">
        <div className="container">
          <a className="navbar-brand" href="#top" aria-label="Gabai home">
            <i className="bi bi-shield-lock-fill" /> Gabai
          </a>
        </div>
      </nav>

      <main id="top">
        <section className="landing-hero">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h1 className="landing-hero-title">
                  Smart Parental Control for Modern Families
                </h1>
                <p className="landing-hero-subtitle">
                  Manage screen time, block apps, monitor device activity, and
                  protect your children using the Gabai parental control system.
                </p>
                <div className="d-flex gap-3 flex-wrap mt-4">
                  <a href="#downloads" className="btn btn-light btn-lg landing-download-btn">
                    Download App
                  </a>
                  <a href="#features" className="btn btn-outline-light btn-lg landing-download-btn">
                    Learn More
                  </a>
                </div>
              </div>

              <div className="col-lg-6 text-center">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                  alt="A family device showing app controls"
                  className="img-fluid landing-phone-preview"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-5" id="downloads">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="landing-section-title">Download Gabai</h2>
              <p className="text-muted fs-5">
                One application for both parents and child devices.
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="landing-download-card text-center">
                  <div className="landing-icon-box landing-parent-icon mx-auto">
                    <i className="bi bi-shield-lock-fill" />
                  </div>

                  <h3 className="fw-bold mb-3">Gabai Application</h3>
                  <p className="text-muted mb-4 fs-5">
                    Install Gabai on both the parent and child devices. Parents
                    can manage restrictions while child devices receive
                    protection, monitoring, screen-time limits, bedtime
                    enforcement, and app blocking.
                  </p>

                  <div className="row text-start g-3 mb-4">
                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100">
                        <h5 className="fw-bold text-primary mb-3">
                          <i className="bi bi-person-workspace" /> Parent Features
                        </h5>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-primary" /> Monitor activity
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-primary" /> Set screen limits
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-primary" /> Block applications
                          </li>
                          <li>
                            <i className="bi bi-check-circle-fill text-primary" /> Configure bedtime schedules
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded-4 p-3 h-100">
                        <h5 className="fw-bold text-success mb-3">
                          <i className="bi bi-phone" /> Child Device Features
                        </h5>
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-success" /> Real-time app blocking
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-success" /> Screen-time enforcement
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle-fill text-success" /> Bedtime lock mode
                          </li>
                          <li>
                            <i className="bi bi-check-circle-fill text-success" /> Secure device monitoring
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid">
                    <a href="#downloads" className="btn btn-primary btn-lg landing-download-btn">
                      <i className="bi bi-google-play" /> Download Gabai APK
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-5 bg-white" id="features">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="landing-section-title">Why Choose Gabai?</h2>
              <p className="text-muted fs-5">
                Built for safety, productivity, and digital wellness.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="landing-feature-card text-center">
                  <i className="bi bi-clock-history fs-1 text-primary" />
                  <h5 className="fw-bold mt-3">Screen Time</h5>
                  <p className="text-muted">Set daily limits and control usage schedules.</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="landing-feature-card text-center">
                  <i className="bi bi-app-indicator fs-1 text-success" />
                  <h5 className="fw-bold mt-3">App Blocking</h5>
                  <p className="text-muted">Block distracting or harmful applications instantly.</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="landing-feature-card text-center">
                  <i className="bi bi-moon-stars-fill fs-1 text-dark" />
                  <h5 className="fw-bold mt-3">Bedtime Mode</h5>
                  <p className="text-muted">Automatically lock devices during sleep hours.</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="landing-feature-card text-center">
                  <i className="bi bi-shield-check fs-1 text-danger" />
                  <h5 className="fw-bold mt-3">Protection</h5>
                  <p className="text-muted">Secure monitoring with parental control enforcement.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-5">
          <div className="container py-5">
            <div className="landing-cta text-white p-5 text-center shadow-lg">
              <h2 className="fw-bold display-5 mb-3">Start Protecting Your Family Today</h2>
              <p className="fs-5 mb-4">
                Download Gabai now and create a safer digital environment for your children.
              </p>
              <a href="#downloads" className="btn btn-light btn-lg px-5 py-3 fw-bold">
                Get Started
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container text-center">
          <h5 className="fw-bold mb-3">
            <i className="bi bi-shield-lock-fill" /> Gabai
          </h5>
          <p className="mb-2">Smart parental control system for safer device usage.</p>
          <small className="text-light opacity-75">
            &copy; 2026 Gabai Application. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
