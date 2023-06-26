import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
} from '@mui/joy';

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
    urlRegex.test(event.target.value)
      ? setIsUrlValid(true)
      : setIsUrlValid(false);
    setUrl(event.target.value);
  };

  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(true);

  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (!isUrlValid || !urlRegex.test(url)) {
      event.preventDefault();
      setIsUrlValid(false);
    } else {
      event.preventDefault();
      setIsUrlValid(true);
      setFetching(true);
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`
      );
      const data = await response.json();
      setResults(data.lighthouseResult.audits);
      setFetching(false);
    }
  };

  return (
    <FormControl component='form' onSubmit={handleSubmit}>
      <FormLabel>Enter URL</FormLabel>
      <Grid container spacing={2} sx={{ padding: 0 }}>
        <Grid sx={{ flexGrow: 1 }}>
          <Input
            type='text'
            id='url-input'
            placeholder='https://example.com'
            onChange={handleInput}
            error={!isUrlValid}
            endDecorator={
              <Button type='submit' variant='solid'>
                Analyze
              </Button>
            }
          />
          {!isUrlValid && (
            <FormHelperText>
              Invalid URL format. Please try again.
            </FormHelperText>
          )}
        </Grid>
      </Grid>
    </FormControl>
  );
};
