/* eslint-disable react/jsx-pascal-case */
import { ChainId, ExplorerTarget, formatAmount, formatDollarAmount, getExplorerLink } from '@koyofinance/core-sdk';
import BarChart from 'components/BarChart/alt';
import { DarkGreyCard, GreyBadge, GreyCard } from 'components/Card';
import { AutoColumn } from 'components/Column';
import CurrencyLogo from 'components/CurrencyLogo';
import LineChart from 'components/LineChart/alt';
import { LocalLoader } from 'components/Loader';
import Percent from 'components/Percent';
import PoolCurrencyLogo from 'components/PoolCurrencyLogo';
import QuestionHelper from 'components/QuestionHelper';
import Row, { AutoRow, RowBetween, RowFixed } from 'components/Row';
import { MonoSpace } from 'components/shared';
import { ToggleElementFree, ToggleWrapper } from 'components/Toggle/index';
import TransactionsTable from 'components/TransactionsTable/TransactionsTable';
import { useKoyoPoolData, useKoyoPoolPageData } from 'data/koyo/exchange/usePools';
import { useKoyoTransactionData } from 'data/koyo/exchange/useTransactions';
import useTheme from 'hooks/useTheme';
import { PageWrapper, ThemedBackground } from 'pages/styled';
import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'react-feather';
import { RouteComponentProps } from 'react-router-dom';
import { useActiveNetworkVersion } from 'state/application/hooks';
import styled from 'styled-components';
import { ExternalLink as StyledExternalLink, StyledInternalLink, TYPE } from 'theme';
import { getShortPoolName } from 'utils/getShortPoolName';
import { networkPrefix } from 'utils/networkPrefix';
import { swapFeePercent } from 'utils/swapFeePercent';
import { tokenWeightPercent } from 'utils/tokenWeightPercent';

const ContentLayout = styled.div`
	display: grid;
	grid-template-columns: 300px 1fr;
	grid-gap: 1em;

	@media screen and (max-width: 800px) {
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 1fr;
	}
`;

const TokenButton = styled(GreyCard)`
	padding: 8px 12px;
	border-radius: 10px;
	:hover {
		cursor: pointer;
		opacity: 0.6;
	}
`;

const ResponsiveRow = styled(RowBetween)`
	${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`;

const TokenResponsiveRow = styled(Row)`
	${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    align-items: flex-start;
    row-gap: 24px;
    width: 100%:
  `};
`;

const ToggleRow = styled(RowBetween)`
	@media screen and (max-width: 600px) {
		flex-direction: column;
	}
`;

enum ChartView {
	TVL,
	VOL,
	UTILISATION,
	FEES
}

const PoolPage: React.FC<RouteComponentProps<{ poolId: string }>> = ({
	match: {
		params: { poolId }
	}
}) => {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const [activeNetwork] = useActiveNetworkVersion();

	// theming
	const theme = useTheme();
	const backgroundColor = 'rgb(36, 156, 108)';

	const poolData = useKoyoPoolData(poolId);
	const { tvlData, volumeData, utilisationData, feesData } = useKoyoPoolPageData(poolId);

	const { swaps, joinsExits } = useKoyoTransactionData(
		(poolData?.tokens || []).map((token) => token.address),
		poolData ? [poolData.id] : []
	);

	const [view, setView] = useState(ChartView.VOL);
	const [latestValue, setLatestValue] = useState<number | undefined>();
	const [valueLabel, setValueLabel] = useState<string | undefined>();

	return (
		<PageWrapper>
			<ThemedBackground backgroundColor={backgroundColor} />
			{poolData ? (
				<AutoColumn gap="32px">
					<RowBetween>
						<AutoRow gap="4px">
							<StyledInternalLink to={networkPrefix(activeNetwork)}>
								<TYPE.main>{`Home > `}</TYPE.main>
							</StyledInternalLink>
							<StyledInternalLink to={`${networkPrefix(activeNetwork)}pools`}>
								<TYPE.label>{` Pools `}</TYPE.label>
							</StyledInternalLink>
							<TYPE.main>{` > `}</TYPE.main>
							<TYPE.label>{` ${getShortPoolName(poolData)} ${swapFeePercent(poolData.swapFee)} `}</TYPE.label>
						</AutoRow>
						<RowFixed gap="10px" align="center">
							<StyledExternalLink
								href={getExplorerLink(activeNetwork.id as unknown as ChainId, ExplorerTarget.ADDRESS, poolData.address)}
							>
								<ExternalLink stroke={theme.text2} size={'17px'} style={{ marginLeft: '12px' }} />
							</StyledExternalLink>
						</RowFixed>
					</RowBetween>
					<ResponsiveRow align="flex-end">
						<AutoColumn gap="lg">
							<RowFixed>
								<PoolCurrencyLogo tokens={poolData.tokens} size={24} />
								<TYPE.label ml="8px" mr="8px" fontSize="24px">{`${getShortPoolName(poolData)}`}</TYPE.label>
								<GreyBadge>{swapFeePercent(poolData.swapFee)}</GreyBadge>
							</RowFixed>
							<TokenResponsiveRow>
								{poolData.tokens.map((token) => (
									<StyledInternalLink to={`${networkPrefix(activeNetwork)}tokens/${token.address}`} key={token.address} mr="10px">
										<TokenButton>
											<RowFixed>
												<CurrencyLogo address={token.address} size={'20px'} />
												<TYPE.label fontSize="16px" ml="4px" style={{ whiteSpace: 'nowrap' }} width={'fit-content'}>
													{`${token.weight ? tokenWeightPercent(token.weight) : ''} ${
														poolData.tokens.length < 5 ? token.symbol : ''
													} `}
												</TYPE.label>
											</RowFixed>
										</TokenButton>
									</StyledInternalLink>
								))}
							</TokenResponsiveRow>
						</AutoColumn>
					</ResponsiveRow>
					<ContentLayout>
						<DarkGreyCard>
							<AutoColumn gap="lg">
								<GreyCard padding="16px">
									<AutoColumn gap="md">
										<TYPE.main>Total Tokens Locked</TYPE.main>
										{poolData.tokens.map((token) =>
											token.tvl < 1000000000 ? (
												<RowBetween key={token.address}>
													<RowFixed>
														<CurrencyLogo address={token.address} size={'20px'} />
														<TYPE.label fontSize="14px" ml="8px">
															{token.symbol}
														</TYPE.label>
													</RowFixed>
													<TYPE.label fontSize="14px">{formatAmount(token.tvl / token.price)}</TYPE.label>
												</RowBetween>
											) : null
										)}
									</AutoColumn>
								</GreyCard>
								<AutoColumn gap="4px">
									<TYPE.main fontWeight={400}>TVL</TYPE.main>
									<TYPE.label fontSize="24px">{formatDollarAmount(poolData.tvlUSD)}</TYPE.label>
									<Percent value={poolData.tvlUSDChange} />
								</AutoColumn>
								<AutoColumn gap="4px">
									<TYPE.main fontWeight={400}>Volume 24h</TYPE.main>
									<TYPE.label fontSize="24px">{formatDollarAmount(poolData.volumeUSD)}</TYPE.label>
									<Percent value={poolData.volumeUSDChange} />
								</AutoColumn>
								<AutoColumn gap="4px">
									<TYPE.main fontWeight={400}>24h Fees</TYPE.main>
									<TYPE.label fontSize="24px">{formatDollarAmount(poolData.feesUSD)}</TYPE.label>
								</AutoColumn>
							</AutoColumn>
						</DarkGreyCard>
						<DarkGreyCard>
							<ToggleRow align="flex-start">
								<AutoColumn>
									<TYPE.label fontSize="24px" height="30px">
										<MonoSpace>
											{latestValue
												? view === ChartView.UTILISATION
													? `${Math.abs(latestValue).toFixed(3)}%`
													: formatDollarAmount(latestValue, 2)
												: view === ChartView.VOL
												? formatDollarAmount(volumeData[volumeData.length - 1]?.value)
												: view === ChartView.TVL
												? formatDollarAmount(tvlData[tvlData.length - 1]?.value)
												: view === ChartView.UTILISATION
												? `${Math.abs(utilisationData[utilisationData.length - 1]?.value).toFixed(3)}%`
												: formatDollarAmount(feesData[feesData.length - 1]?.value)}{' '}
										</MonoSpace>
									</TYPE.label>
									<TYPE.main height="20px" fontSize="12px">
										{valueLabel ? <MonoSpace>{valueLabel} (UTC)</MonoSpace> : ''}
									</TYPE.main>
								</AutoColumn>
								<ToggleWrapper width="300px">
									<ToggleElementFree
										isActive={view === ChartView.VOL}
										fontSize="12px"
										onClick={() => (view === ChartView.VOL ? setView(ChartView.TVL) : setView(ChartView.VOL))}
									>
										Volume
									</ToggleElementFree>
									<ToggleElementFree
										isActive={view === ChartView.TVL}
										fontSize="12px"
										onClick={() => (view === ChartView.TVL ? setView(ChartView.TVL) : setView(ChartView.TVL))}
									>
										TVL
									</ToggleElementFree>
									<ToggleElementFree
										isActive={view === ChartView.UTILISATION}
										fontSize="12px"
										onClick={() => (view === ChartView.UTILISATION ? setView(ChartView.TVL) : setView(ChartView.UTILISATION))}
									>
										Utilisation <QuestionHelper text={'24h Volume/Liquidity ratio'} />
									</ToggleElementFree>
									<ToggleElementFree
										isActive={view === ChartView.FEES}
										fontSize="12px"
										onClick={() => (view === ChartView.FEES ? setView(ChartView.TVL) : setView(ChartView.FEES))}
									>
										Fees
									</ToggleElementFree>
								</ToggleWrapper>
							</ToggleRow>
							{view === ChartView.TVL ? (
								<LineChart
									data={tvlData}
									setLabel={setValueLabel}
									color={backgroundColor}
									minHeight={340}
									setValue={setLatestValue}
									value={latestValue}
									label={valueLabel}
								/>
							) : view === ChartView.UTILISATION ? (
								<LineChart
									data={utilisationData}
									setLabel={setValueLabel}
									color={backgroundColor}
									minHeight={340}
									setValue={setLatestValue}
									value={latestValue}
									label={valueLabel}
								/>
							) : view === ChartView.VOL ? (
								<BarChart
									data={volumeData}
									color={backgroundColor}
									minHeight={340}
									setValue={setLatestValue}
									setLabel={setValueLabel}
									value={latestValue}
									label={valueLabel}
								/>
							) : (
								<BarChart
									data={feesData}
									color={backgroundColor}
									minHeight={340}
									setValue={setLatestValue}
									setLabel={setValueLabel}
									value={latestValue}
									label={valueLabel}
								/>
							)}
						</DarkGreyCard>
					</ContentLayout>
					<TYPE.main fontSize="24px">Swaps</TYPE.main>
					<DarkGreyCard>
						{swaps.length > 0 || joinsExits.length > 0 ? (
							<TransactionsTable swaps={swaps} joinsExits={joinsExits} />
						) : (
							<LocalLoader fill={false} />
						)}
					</DarkGreyCard>
				</AutoColumn>
			) : (
				<AutoColumn gap="lg">
					<DarkGreyCard>
						<TYPE.main fontSize="24px">Fetching pool data...</TYPE.main>
						<LocalLoader fill={false} />
					</DarkGreyCard>
				</AutoColumn>
			)}
		</PageWrapper>
	);
};

export default PoolPage;
