import { useEffect, useState } from 'react';
import { Grid } from '@mui/joy';
import { FormComponent } from './FormComponent';
import { ListComponent } from './ListComponent';

export const Main = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<string[] | null>(null);
  const [resultsArray, setResultsArray] = useState<string[] | null>(null);
  const [GPTAnswers, setGPTAnswers] = useState<Array<unknown>>([]);
  const [isFetching, setFetching] = useState(false);
  const [isFetchingGPTIndex, setFetchingGPTIndex] = useState<number | null>(
    null
  );
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: 'just now',
      direction: 'incoming',
      sender: 'ChatGPT',
    },
  ]);

  useEffect(() => {
    if (results && typeof results === 'object') {
      const resultsArray = Object.values(results);

      setResultsArray(
        resultsArray.map((result: any) =>
          result.description
            .replaceAll(/\[(Learn\s[^\]]+)\]|\((https?:\/\/\S+)\)/g, '')
            .replaceAll(' .', '')
        )
      );
    }
  }, [results]);

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Grid xs={10} md={8}>
          <FormComponent
            url={url}
            setUrl={setUrl}
            setFetching={setFetching}
            setResults={setResults}
          />
        </Grid>
        <Grid xs={10} md={8}>
          <ListComponent
            isFetchingGPTIndex={isFetchingGPTIndex}
            setFetchingGPTIndex={setFetchingGPTIndex}
            GPTAnswers={GPTAnswers}
            setGPTAnswers={setGPTAnswers}
            isFetching={isFetching}
            resultsArray={resultsArray}
            messages={messages}
          />
        </Grid>
      </Grid>
    </>
  );
};
