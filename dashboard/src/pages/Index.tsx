import { Divider } from '@mui/material';

import Attribution from '../Attribution';
import Diagnostics from '../Diagnostics';

function Index() {
  return (
    <>
      <h1>homelab</h1>
      <Divider>Diagnostics</Divider>
      <Diagnostics />
      <Divider>Attribution</Divider>
      <Attribution />
    </>
  );
}

export default Index;
