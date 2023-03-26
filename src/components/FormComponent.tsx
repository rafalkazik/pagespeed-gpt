import { ChangeEvent, FormEvent } from 'react';
import { Button, FormControl, FormLabel, Grid, Input } from '@mui/joy';

interface FormComponentProps {
  url: string;
  setUrl: (url: string) => void;
  setFetching: (fetching: boolean) => void;
  setResults: (results: string[] | null) => void;
}

export const FormComponent = ({
  url,
  setUrl,
  setFetching,
  setResults,
}: FormComponentProps) => {
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

  return (
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
  );
};
