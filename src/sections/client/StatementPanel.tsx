import { useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// components
import Scrollbar from 'src/components/scrollbar';
// auth
import { hasPermission } from 'src/auth/context/jwt/utils';
import { Authorities } from 'src/utils/authorities';
import { firstDayOfMonthMaputo, formatDate, formatMzn, todayMaputo } from 'src/utils/maputo-time';
// redux
import { useGetStatementQuery } from 'src/redux/services/reportService';
//
import ExportButton from '../shared/ExportButton';

// ----------------------------------------------------------------------

/**
 * Extracto da conta corrente: saldo inicial, servicos, pagamentos, correccoes e
 * saldo final do periodo, separado da divida actual.
 */
export default function StatementPanel({ clientId }: { clientId: number }) {
  const [startDate, setStartDate] = useState(firstDayOfMonthMaputo());
  const [endDate, setEndDate] = useState(todayMaputo());

  const { currentData: statement, isFetching } = useGetStatementQuery({
    clientId,
    startDate,
    endDate,
  });

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
          sx={{ mb: 3 }}
        >
          <TextField
            size="small"
            type="date"
            label="De"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="Até"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Stack sx={{ flexGrow: 1 }} />
          {hasPermission([Authorities.EXPORT_STATEMENTS]) && (
            <ExportButton
              context={`statement/${clientId}`}
              fileName="extracto"
              params={{ startDate, endDate }}
            />
          )}
        </Stack>

        {statement && (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 2 }}>
              <Typography variant="body2">
                Saldo inicial: {formatMzn(statement.openingBalance)}
              </Typography>
              <Typography variant="body2">
                Saldo final do período: {formatMzn(statement.closingBalance)}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'error.main' }}>
                Dívida actual (hoje): {formatMzn(statement.currentDebt)}
              </Typography>
            </Stack>
            <Scrollbar>
              <Table size="small" sx={{ minWidth: 720, opacity: isFetching ? 0.6 : 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Referência</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell align="right">Débito</TableCell>
                    <TableCell align="right">Crédito</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatDate(statement.startDate)}</TableCell>
                    <TableCell />
                    <TableCell>Saldo inicial</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">{formatMzn(statement.openingBalance)}</TableCell>
                  </TableRow>
                  {statement.lines.map((line, index) => (
                    <TableRow key={`${line.reference}-${index}`}>
                      <TableCell>{formatDate(line.date)}</TableCell>
                      <TableCell>{line.reference}</TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell align="right">{line.debit ? formatMzn(line.debit) : ''}</TableCell>
                      <TableCell align="right">
                        {line.credit ? formatMzn(line.credit) : ''}
                      </TableCell>
                      <TableCell align="right">{formatMzn(line.balance)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="subtitle2">Totais</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatMzn(statement.totalDebits)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatMzn(statement.totalCredits)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {formatMzn(statement.closingBalance)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Scrollbar>
          </>
        )}
      </CardContent>
    </Card>
  );
}
