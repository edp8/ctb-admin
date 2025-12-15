import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../context/AuthProvider";

const COLOR_BASE = "#E87461";
const COLOR_ACCENT = "#EBA844";

const fadeIn = keyframes`
  from { opacity:0; transform: translateY(10px); }
  to { opacity:1; transform: translateY(0); }
`;

const Page = styled.main`
  font-family: "system-ui", sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, ${COLOR_BASE}10, ${COLOR_ACCENT}20);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  animation: ${fadeIn} 0.5s ease;
`;

const Header = styled.header`
  width: 100%;
  max-width: 960px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
`;

const Title = styled.h2`
  color: ${COLOR_BASE};
  font-weight: 600;
  font-size: 26px;
  margin: 0;
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #333;
`;

const Tag = styled.span`
  color: white;
  background: linear-gradient(90deg, ${COLOR_ACCENT}, ${COLOR_BASE});
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
`;

const LogoutBtn = styled.button`
  background: none;
  border: 2px solid ${COLOR_BASE};
  color: ${COLOR_BASE};
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
  &:hover { background: ${COLOR_BASE}10; }
`;

const Grid = styled.section`
  width: 100%;
  max-width: 960px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${fadeIn} 0.4s ease;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: ${COLOR_ACCENT};
`;

const CardDesc = styled.p`
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
  min-height: 42px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const PrimaryLink = styled(Link)`
  flex: 1;
  text-align: center;
  text-decoration: none;
  background: linear-gradient(90deg, ${COLOR_BASE}, ${COLOR_ACCENT});
  color: white;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
  transition: 0.2s;
  &:hover { opacity: 0.95; transform: translateY(-1px); }
`;

const DisabledBtn = styled.button`
  flex: 1;
  text-align: center;
  background: #f2f2f2;
  color: #9a9a9a;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed #ddd;
  font-weight: 600;
  cursor: not-allowed;
`;

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Page>
      <Header>
        <Title>Tableau de bord</Title>
        <UserBox>
          <span>{user?.email}</span>
          {user?.role && <Tag>{user.role}</Tag>}
          <LogoutBtn onClick={logout}>Déconnexion</LogoutBtn>
        </UserBox>
      </Header>

      <Grid>
        {/* Infolettre (actif) */}
        <Card>
          <CardTitle>Infolettre</CardTitle>
          <CardDesc>Gérer et extraire les emails des abonnés.</CardDesc>
          <Actions>
            <PrimaryLink to="/newsletter">Ouvrir</PrimaryLink>
          </Actions>
        </Card>

        {/* Boutons désactivés */}
        <Card title="Bientôt disponible">
          <CardTitle>Cours – Arts martiaux</CardTitle>
          <CardDesc>Créer, planifier et gérer les cours.</CardDesc>
          <Actions>
            <DisabledBtn disabled title="Fonction bientôt disponible">À venir</DisabledBtn>
          </Actions>
        </Card>

        <Card title="Bientôt disponible">
          <CardTitle>Thérapies Alternatives</CardTitle>
          <CardDesc>Gérer les créneaux, tarifs et réservations.</CardDesc>
          <Actions>
            <DisabledBtn disabled title="Fonction bientôt disponible">À venir</DisabledBtn>
          </Actions>
        </Card>

        <Card title="Bientôt disponible">
          <CardTitle>Capsules</CardTitle>
          <CardDesc>Gérer vos contenus vidéo/audio payants.</CardDesc>
          <Actions>
            <DisabledBtn disabled title="Fonction bientôt disponible">À venir</DisabledBtn>
          </Actions>
        </Card>

        <Card title="Bientôt disponible">
          <CardTitle>Pensées</CardTitle>
          <CardDesc>Publier des pensées courtes et inspirantes.</CardDesc>
          <Actions>
            <PrimaryLink to="/quotes">Ouvrir</PrimaryLink>
          </Actions>
        </Card>
      </Grid>
    </Page>
  );
}