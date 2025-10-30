import { Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';

export default function DoctorLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
