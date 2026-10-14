// @mui
import MenuItem from '@mui/material/MenuItem';
// utils
// components
import React, { useEffect, useState } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  SelectChangeEvent, 
  Box, 
  Typography,
  Chip,
  alpha,
  Stack,
  Avatar,
  Fade,
  CircularProgress,
  TextField,
  InputAdornment,
  Divider,
  ListSubheader,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IUser } from '../../types/user';
import { ITenant } from '../../types/tenant';
import { enqueueSnackbar } from 'notistack';
import { getActiveTenant, getCurrentCompany, getRefreshToken, isValidToken, getAccessToken, refreshSession, setActiveTenant, setSession } from '../../auth/context/jwt/utils';
import axios, { endpoints, getApiErrorMessage } from '../../utils/axios';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------


type Props = {
  loggedUser: IUser | undefined;
}


export default function CompanySwitch({ loggedUser }: Props) {
  const theme = useTheme();
  const [company, setCompany] = React.useState('');
  const [hasManyLocations, setHasManyLocations] = React.useState(false);
  const [isChanging, setIsChanging] = React.useState(false);
  const [searchText, setSearchText] = useState('');

  const handleChange = async (event: SelectChangeEvent) => {
    const tenantId = event.target.value as string;
    if (!tenantId || tenantId === company) {
      return;
    }

    const previousCompany = company;
    setCompany(tenantId);
    setActiveTenant(tenantId);
    setIsChanging(true);

    try {
      if (!getRefreshToken()) {
        throw new Error('Sessão inválida. Volte a autenticar-se.');
      }
      if (!isValidToken(getAccessToken())) {
        await refreshSession();
      }
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error('Sessão inválida. Volte a autenticar-se.');
      }
      const res = await axios.put(endpoints.auth.switchCompany, {
        tenantId,
        refreshToken: currentRefreshToken,
      });
      const accessToken = typeof res.data === 'string' ? res.data.replace(/^"|"$/g, '') : '';
      if (!accessToken) {
        throw new Error('Resposta inválida ao trocar de empresa');
      }
      setSession(accessToken);
      window.location.reload();
    } catch (error) {
      setCompany(previousCompany);
      setActiveTenant(previousCompany || null);
      enqueueSnackbar(getApiErrorMessage(error, 'Não foi possível trocar de empresa.'), {
        variant: 'error',
      });
    } finally {
      setIsChanging(false);
    }
  };

  useEffect(() => {
    const hasLocations = loggedUser !== undefined && loggedUser.businessLocations !== undefined && loggedUser.businessLocations.length > 1;
    setHasManyLocations(hasLocations);
    const current = getCurrentCompany() || getActiveTenant();
    if (current && hasLocations) setCompany(current);
  }, [loggedUser]);

  const getCompanyInitials = (name: string | undefined) => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Filtrar empresas baseado na busca
  const filteredCompanies = React.useMemo(() => {
    if (!loggedUser?.businessLocations) return [];
    
    if (!searchText.trim()) {
      return loggedUser.businessLocations;
    }

    const search = searchText.toLowerCase().trim();
    return loggedUser.businessLocations.filter((company: ITenant) => 
      company.tenantName?.toLowerCase().includes(search) ||
      company.tenantId?.toLowerCase().includes(search)
    );
  }, [loggedUser?.businessLocations, searchText]);

  // Separar empresa ativa das outras
  const activeCompany = filteredCompanies.find((n: ITenant) => n.tenantId === company);
  const otherCompanies = filteredCompanies.filter((n: ITenant) => n.tenantId !== company);

  const totalCompanies = loggedUser?.businessLocations?.length || 0;
  const showSearch = totalCompanies > 5; // Mostrar busca se tiver mais de 5 empresas

  return (
    <>
      {hasManyLocations && (
        <FormControl 
          sx={{
            minWidth: 240,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.2s ease',
              background: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              '&:hover': {
                background: theme.palette.background.paper,
                boxShadow: theme.customShadows.z8,
              },
              '&.Mui-focused': {
                background: theme.palette.background.paper,
                boxShadow: theme.customShadows.z16,
              },
            },
          }}
        >
          <InputLabel 
            id="company-select-label"
            sx={{
              fontWeight: 600,
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:buildings-bold-duotone" width={18} />
              <span>Empresa</span>
            </Stack>
          </InputLabel>
          <Select
            size="small"
            labelId="company-select-label"
            id="company-select"
            value={company}
            label="Empresa"
            onChange={handleChange}
            disabled={isChanging}
            onClose={() => setSearchText('')}
            renderValue={(selected) => {
              const selectedCompany = loggedUser?.businessLocations?.find(
                (loc: ITenant) => loc.tenantId === selected
              );
              return (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    {getCompanyInitials(selectedCompany?.tenantName)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedCompany?.tenantName}
                    </Typography>
                  </Box>
                  {isChanging && (
                    <CircularProgress size={16} sx={{ color: theme.palette.primary.main }} />
                  )}
                </Stack>
              );
            }}
            sx={{
              '& .MuiSelect-select': {
                py: 1.5,
                px: 2,
              },
            }}
            MenuProps={{
              autoFocus: false,
              PaperProps: {
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: theme.customShadows.dropdown,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  maxHeight: 480,
                  width: 360,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    transition: 'all 0.2s ease',
                  },
                  '& .MuiList-root': {
                    py: 1,
                  },
                },
              },
            }}
          >
            {/* Campo de Busca */}
            {showSearch && (
              <ListSubheader
                sx={{
                  bgcolor: 'transparent',
                  p: 2,
                  pb: 1,
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  backdropFilter: 'blur(8px)',
                  background: alpha(theme.palette.background.paper, 0.95),
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  placeholder="Buscar empresa..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify 
                          icon="eva:search-fill" 
                          width={20} 
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: searchText && (
                      <InputAdornment position="end">
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchText('');
                          }}
                          sx={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: alpha(theme.palette.grey[500], 0.12),
                            },
                          }}
                        >
                          <Iconify 
                            icon="eva:close-fill" 
                            width={16} 
                            sx={{ color: theme.palette.text.secondary }}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      '&:hover': {
                        boxShadow: theme.customShadows.z8,
                      },
                    },
                  }}
                />
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  justifyContent="space-between"
                  sx={{ mt: 1.5, px: 0.5 }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {filteredCompanies.length} de {totalCompanies} empresas
                  </Typography>
                  {searchText && (
                    <Chip 
                      label={`${filteredCompanies.length} resultado${filteredCompanies.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.688rem',
                        fontWeight: 600,
                        background: alpha(theme.palette.info.main, 0.12),
                        color: theme.palette.info.dark,
                      }}
                    />
                  )}
                </Stack>
              </ListSubheader>
            )}

            {/* Empresa Ativa */}
            {activeCompany && (
              <>
                {showSearch && (
                  <ListSubheader
                    sx={{
                      bgcolor: 'transparent',
                      px: 3,
                      py: 1,
                      fontSize: '0.688rem',
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Empresa Ativa
                  </ListSubheader>
                )}
                <MenuItem 
                  value={activeCompany.tenantId}
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.primary.dark, 0.12)} 100%)`,
                    },
                    '&.Mui-selected': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.primary.dark, 0.12)} 100%)`,
                      },
                    },
                  }}
                >
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1.5} 
                    sx={{ width: '100%' }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: '#fff',
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                      }}
                    >
                      {getCompanyInitials(activeCompany.tenantName)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activeCompany.tenantName}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.688rem',
                        }}
                      >
                        ID: {activeCompany.tenantId}
                      </Typography>
                    </Box>
                    <Fade in>
                      <Chip
                        label="Ativa"
                        size="small"
                        icon={<Iconify icon="eva:checkmark-circle-2-fill" width={14} />}
                        sx={{
                          height: 24,
                          fontSize: '0.688rem',
                          fontWeight: 600,
                          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                          color: '#fff',
                          border: 'none',
                          '& .MuiChip-icon': {
                            color: '#fff',
                          },
                        }}
                      />
                    </Fade>
                  </Stack>
                </MenuItem>
                
                {otherCompanies.length > 0 && (
                  <>
                    <Divider sx={{ my: 1, mx: 2 }} />
                    {showSearch && (
                      <ListSubheader
                        sx={{
                          bgcolor: 'transparent',
                          px: 3,
                          py: 1,
                          fontSize: '0.688rem',
                          fontWeight: 700,
                          color: theme.palette.text.secondary,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Outras Empresas
                      </ListSubheader>
                    )}
                  </>
                )}
              </>
            )}

            {/* Outras Empresas */}
            {otherCompanies.length > 0 ? (
              otherCompanies.map((n : ITenant) => (
                <MenuItem 
                  key={n.id} 
                  value={n.tenantId}
                  sx={{
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={1.5} 
                    sx={{ width: '100%' }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        fontSize: '0.813rem',
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.12)} 0%, ${alpha(theme.palette.grey[600], 0.08)} 100%)`,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {getCompanyInitials(n.tenantName)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          mb: 0.25,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.tenantName}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontSize: '0.688rem',
                        }}
                      >
                        ID: {n.tenantId}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))
            ) : searchText ? (
              <Box
                sx={{
                  py: 6,
                  px: 3,
                  textAlign: 'center',
                }}
              >
                <Iconify 
                  icon="eva:search-outline" 
                  width={48} 
                  sx={{ 
                    color: theme.palette.text.disabled,
                    mb: 2,
                  }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                  Nenhuma empresa encontrada
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                  Tente outro termo de busca
                </Typography>
              </Box>
            ) : null}
          </Select>
        </FormControl>
      )}
    </>
  );
}
