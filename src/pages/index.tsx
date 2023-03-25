import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  Input,
  List,
  ListDivider,
  ListItem,
  Typography,
} from '@mui/joy';

interface GPTResponseType {
  message: string;
  sentTime?: string;
  direction: string;
  sender: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<string[] | null>(null);
  const [resultsArray, setResultsArray] = useState<string[] | null>(null);
  const [GPTAnswers, setGPTAnswers] = useState<Array<unknown>>([]);
  const [isFetching, setFetching] = useState(false);
  const [isFetchingGPT, setFetchingGPT] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sentTime: 'just now',
      direction: 'incoming',
      sender: 'ChatGPT',
    },
  ]);

  const systemMessage = {
    role: 'system',
    content: `On this page you will find responses from the Google PageSpeed Insights API. Explain the given instruction as if you were explaining it to a layman, i.e. how to do it and explain the purpose, because it is supposed to help improve the website. Use no more than 3 or 4 sentences. Remember - don't greet the user, just explain.`,
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFetching(true);
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`
    );
    const data = await response.json();
    setResults(data.lighthouseResult.audits);
    setFetching(false);
  };

  const handleGPTQuestion = async (message: string, index: number) => {
    const newMessage = {
      message: message,
      direction: 'outgoing',
      sender: 'user',
    };
    const newMessages = [...messages, newMessage];

    setFetchingGPT(true);
    await handleGPTMessage(newMessages, index);
  };

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

  const handleGPTMessage = async (
    GPTMessages: GPTResponseType[],
    index: number
  ) => {
    let apiMessages = GPTMessages.map((messageObject: GPTResponseType) => {
      let role = '';
      messageObject.sender === 'ChatGPT'
        ? (role = 'assistant')
        : (role = 'user');

      return { role: role, content: messageObject.message };
    });
    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...apiMessages],
    };

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const newAnswers: Array<unknown> = [...GPTAnswers];
        newAnswers[index] = data.choices[0].message.content;
        setGPTAnswers(newAnswers);
        setFetchingGPT(false);
      });
  };

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <Grid xs={10} md={8}>
          <FormControl component='form' onSubmit={handleSubmit}>
            <FormLabel>Enter URL</FormLabel>
            <Grid container spacing={2} sx={{ padding: 0 }}>
              <Grid sx={{ flexGrow: 1 }}>
                <Input
                  type='text'
                  id='url-input'
                  placeholder='Type in here…'
                  onChange={handleInput}
                />
              </Grid>
              <Grid>
                <Button type='submit' variant='solid'>
                  Analyze
                </Button>
              </Grid>
            </Grid>
          </FormControl>
        </Grid>
        <Grid xs={10} md={8}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            {' '}
            {isFetching ? (
              <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Grid>
            ) : (
              <List
                variant='outlined'
                sx={{
                  bgcolor: 'background.body',
                  minWidth: 240,
                  borderRadius: 'sm',
                  boxShadow: 'sm',
                  '--ListItemDecorator-size': '48px',
                }}
              >
                {resultsArray ? (
                  resultsArray.map((result: string, index: number) => (
                    <>
                      <ListItem
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'space-between',
                        }}
                      >
                        <Typography flexGrow={1}>{result}</Typography>
                        <Button
                          variant='outlined'
                          // loading={isFetching}
                          onClick={() => handleGPTQuestion(result, index)}
                        >
                          Explain
                        </Button>
                      </ListItem>
                      {GPTAnswers[index] && (
                        <ListItem>{GPTAnswers[index] as string}</ListItem>
                      )}
                      <ListDivider inset='gutter' />
                    </>
                  ))
                ) : (
                  <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>No results yet</Typography>
                  </Grid>
                )}
              </List>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
