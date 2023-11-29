import { useEffect, useState } from 'react';
import axios from 'axios';

function Diagnostics() {
  const [data, setData] = useState(null);
  const [pihole, setPihole] = useState(null);
  const [lc, setLc] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.69:81/api/diagnostics')
      .then((res) => res.json())
      .then((res) => setData(res))
      .catch((error) => console.log(error));

    axios
      .get('http://192.168.0.69:81/api/pihole/summary')
      .then((response) => {
        setPihole(response.data);
      })
      .catch((error) => console.log(error));

    axios
      .post('https://leetcode.com/graphql/', {
        query:
          '\n    query userPublicProfile($username: String!) {\n  matchedUser(username: $username) {\n    contestBadge {\n      name\n      expired\n      hoverText\n      icon\n    }\n    username\n    githubUrl\n    twitterUrl\n    linkedinUrl\n    profile {\n      ranking\n      userAvatar\n      realName\n      aboutMe\n      school\n      websites\n      countryName\n      company\n      jobTitle\n      skillTags\n      postViewCount\n      postViewCountDiff\n      reputation\n      reputationDiff\n      solutionCount\n      solutionCountDiff\n      categoryDiscussCount\n      categoryDiscussCountDiff\n    }\n  }\n}\n    ',
        variables: {
          username: 'noahtigner',
        },
        operationName: 'userPublicProfile',
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => console.log(error));

    axios
      .get('https://leetcode-stats-api.herokuapp.com/noahtigner')
      .then((response) => {
        setLc(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <pre>{JSON.stringify(data, null, 4)}</pre>
      <pre>{JSON.stringify(pihole, null, 4)}</pre>
      <pre>{JSON.stringify(lc, null, 4)}</pre>
    </div>
  );
}

export default Diagnostics;
