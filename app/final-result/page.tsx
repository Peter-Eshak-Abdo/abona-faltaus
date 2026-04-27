import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const FinalResultPage = () => {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    const teamNameFromQuery = router.query.teamName;
    if (teamNameFromQuery) {
      setTeamName(teamNameFromQuery as string);
    }
  }, [router.query]);

  return (
    <div>
      <h1>النتيجة النهائية</h1>
      <p>الفريق: {teamName}</p>
    </div>
  );
};

export default FinalResultPage;
