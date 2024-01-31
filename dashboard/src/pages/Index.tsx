import { Divider } from '@mui/material';

import Attribution from '../Attribution';
import Diagnostics from '../Diagnostics';

function Index() {
	return (
		<>
			<Diagnostics />
			<Divider>Attribution</Divider>
			<Attribution />
		</>
	);
}

export default Index;
