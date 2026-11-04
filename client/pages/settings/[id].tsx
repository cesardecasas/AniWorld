import {
  Container,
  Tab,
  Nav,
  Col,
  Row,
  Button,
  Modal,
  Figure,
  Form,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api, apiError } from "../../lib/api";
import { Loader } from "../../components/ResponseHandlers";
import type { User, UserInfo, UserStats } from "../../types";

interface SettingsProps {
  inf: UserInfo;
  stats: UserStats | null;
}

const SettingsView = ({ inf, stats }: SettingsProps) => {
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    userName: inf.userName,
    email: inf.email,
    profilePic: inf.profilePic ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const def =
    "https://t3.ftcdn.net/jpg/00/64/67/80/240_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg";

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const deleteAccount = async () => {
    try {
      await api.delete(`/users/${inf.id}`);
      await api.post("/auth/logout");
      // Full reload so the app forgets the deleted session
      window.location.assign("/");
    } catch (error) {
      console.log(error);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await api.patch(`/users/${inf.id}`, { ...form, profilePic: form.profilePic.trim() || null });
      setEditMode(false);
    } catch (err) {
      setSaveError(apiError(err, "Failed to save. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const statRow = (label: string, value: number | string | null) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0.4rem 0",
        borderBottom: "1px solid var(--bs-border-color)",
      }}
    >
      <span style={{ color: "gray" }}>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );

  return (
    <div>
      <Container>
        <Tab.Container id="settings-tabs" defaultActiveKey="account">
          <Row>
            <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="account">Account</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="stats">Stats</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            <Col sm={9}>
              <Tab.Content>
                {/* ── Account tab ── */}
                <Tab.Pane eventKey="account">
                  <section style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h4>Account Information</h4>
                      <Button variant="outline-secondary" size="sm" onClick={() => setEditMode((v) => !v)}>
                        {editMode ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>

                    <Figure.Image
                      style={{ border: "solid 1px black", display: "block", marginBottom: "1rem" }}
                      width={120}
                      height={120}
                      alt="profile picture"
                      src={form.profilePic || def}
                    />

                    {editMode ? (
                      <Form style={{ maxWidth: "400px" }}>
                        <Form.Group className="mb-3">
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            value={form.userName}
                            onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Profile Picture URL</Form.Label>
                          <Form.Control
                            placeholder="https://..."
                            value={form.profilePic}
                            onChange={(e) => setForm((f) => ({ ...f, profilePic: e.target.value }))}
                          />
                        </Form.Group>
                        {saveError && <p style={{ color: "red" }}>{saveError}</p>}
                        <Button variant="dark" onClick={saveProfile} disabled={saving}>
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </Form>
                    ) : (
                      <div>
                        <p>Email: <strong>{form.email}</strong></p>
                        <p>Username: <strong>{form.userName}</strong></p>
                      </div>
                    )}
                  </section>

                  <section>
                    <h4>Delete Account</h4>
                    <Button variant="danger" onClick={handleShow}>
                      Delete Account
                    </Button>
                    <Modal show={show} onHide={handleClose}>
                      <Modal.Header closeButton>
                        <Modal.Title>Delete Account</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        This action is irreversible. Do you want to continue?
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="danger" onClick={deleteAccount}>Delete</Button>
                        <Button variant="dark" onClick={handleClose}>Cancel</Button>
                      </Modal.Footer>
                    </Modal>
                  </section>
                </Tab.Pane>

                {/* ── Stats tab ── */}
                <Tab.Pane eventKey="stats">
                  <h4 style={{ marginBottom: "1.5rem" }}>Your Stats</h4>
                  {!stats ? (
                    <p style={{ color: "gray" }}>No activity yet. Start adding anime and manga to your list!</p>
                  ) : (
                    <Row>
                      <Col md={6} style={{ marginBottom: "2rem" }}>
                        <h5 style={{ borderBottom: "2px solid var(--bs-border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                          Anime
                        </h5>
                        {statRow("Total", stats.anime.total)}
                        {statRow("Watching", stats.anime.in_progress)}
                        {statRow("Completed", stats.anime.completed)}
                        {statRow("On Hold", stats.anime.on_hold)}
                        {statRow("Dropped", stats.anime.dropped)}
                        {statRow("Planned", stats.anime.planned)}
                      </Col>
                      <Col md={6} style={{ marginBottom: "2rem" }}>
                        <h5 style={{ borderBottom: "2px solid var(--bs-border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                          Manga
                        </h5>
                        {statRow("Total", stats.manga.total)}
                        {statRow("Reading", stats.manga.in_progress)}
                        {statRow("Completed", stats.manga.completed)}
                        {statRow("On Hold", stats.manga.on_hold)}
                        {statRow("Dropped", stats.manga.dropped)}
                        {statRow("Planned", stats.manga.planned)}
                      </Col>
                      <Col xs={12}>
                        <h5 style={{ borderBottom: "2px solid var(--bs-border-color)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                          Overall
                        </h5>
                        {statRow("Total Entries", stats.totalEntries)}
                        {statRow("Average Rating", stats.avgRating ? `${stats.avgRating} / 10` : null)}
                      </Col>
                    </Row>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
};

interface SettingsPageProps {
  currentUser: User | null;
}

// Account data needs the login token, which only exists in the browser, so it loads client-side
const Settings = ({ currentUser }: SettingsPageProps) => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [inf, setInf] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const load = async () => {
      // The session cookie is httpOnly, so ask the server who is signed in
      const session = await api.get("/auth/session").catch(() => null);
      const me = session?.data?.user;
      if (!me) return router.replace("/Login");
      if (String(me.id) !== id) return router.replace(`/settings/${me.id}`);

      const [userRes, statsRes] = await Promise.allSettled([api.get(`/users/${id}`), api.get(`/users/${id}/stats`)]);
      if (userRes.status === "fulfilled") setInf(userRes.value.data);
      else setError(apiError(userRes.reason, "Couldn't load your account."));
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    };
    load();
  }, [router, id, currentUser]);

  if (error) return <p style={{ padding: "2rem", textAlign: "center" }}>{error}</p>;
  if (!inf) return <Loader />;
  return <SettingsView inf={inf} stats={stats} />;
};

export default Settings;
