import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack spacing={1}>
      <Typography
        variant="overline"
        sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.14em' }}
      >
        {eyebrow}
      </Typography>
      <Typography variant="h3" component="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}
