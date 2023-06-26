import {
  Box,
  Button,
  CircularProgress,
  Grid,
  List,
  ListDivider,
  ListItem,
  Typography,
} from '@mui/joy';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface GPTResponseType {
  message: string;
  sentTime?: string;
  direction: string;
  sender: string;
}

interface FormComponentProps {
  isFetchingGPTIndex: number | null;
  setFetchingGPTIndex: (fetchingGPTIndex: number | null) => void;
  GPTAnswers: Array<unknown>;
  setGPTAnswers: (GPTAnswers: Array<unknown>) => void;
  isFetching: boolean;
  resultsArray: string[] | null;
  messages: GPTResponseType[];
}

export const ListComponent = ({
  isFetchingGPTIndex,
  setFetchingGPTIndex,
  GPTAnswers,
  setGPTAnswers,
  isFetching,
  resultsArray,
  messages,
}: FormComponentProps) => {
  const handleGPTQuestion = async (message: string, index: number) => {
    setFetchingGPTIndex(index);
    const newMessage = {
      message: message,
      direction: 'outgoing',
      sender: 'user',
    };
    const newMessages = [...messages, newMessage];

    await handleGPTMessage(newMessages, index);
    setFetchingGPTIndex(null);
  };

  useEffect(() => {
    setGPTAnswers([]);
  }, [resultsArray, setGPTAnswers]);

  const systemMessage = {
    role: 'system',
    content: `On this page you will find responses from the Google PageSpeed Insights API. Explain the given instruction as if you were explaining it to a layman, i.e. how to do it and explain the purpose, because it is supposed to help improve the website. Use no more than 3 or 4 sentences. Remember - don't greet the user, just explain.`,
  };

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
      });
  };

  return (
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
                  key={uuidv4()}
                  sx={{
                    display: 'flex',
                    alignItems: 'space-between',
                  }}
                >
                  <Typography flexGrow={1} sx={{ fontWeight: 500 }}>
                    {result}
                  </Typography>
                  <Button
                    variant='outlined'
                    loading={index === isFetchingGPTIndex}
                    onClick={() => handleGPTQuestion(result, index)}
                  >
                    Explain
                  </Button>
                </ListItem>
                {GPTAnswers[index] && (
                  <ListItem key={uuidv4()}>
                    <Typography sx={{ fontWeight: 200, fontStyle: 'italic' }}>
                      {GPTAnswers[index] as string}
                    </Typography>
                  </ListItem>
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
  );
};
