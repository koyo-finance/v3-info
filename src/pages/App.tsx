import { BobaNetworkInfo, SUPPORTED_NETWORK_VERSIONS } from 'constants/networks';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { DarkGreyCard } from '../components/Card';
import Header from '../components/Header';
import TopBar from '../components/Header/TopBar';
import { LocalLoader } from '../components/Loader';
import Popups from '../components/Popups';
import { useActiveNetworkVersion, useSubgraphStatus } from '../state/application/hooks';
import { ExternalLink, TYPE } from '../theme';
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader';
import GaugesOverview from './Gauge/GaugesOverview';
import PoolPage from './Pool/PoolPage';
import PoolsOverview from './Pool/PoolsOverview';
import Protocol from './Protocol';
import ProtocolFees from './ProtocolFees';
import { RedirectInvalidToken } from './Token/redirects';
import TokensOverview from './Token/TokensOverview';
import Treasury from './Treasury';

const AppWrapper = styled.div`
	display: flex;
	flex-flow: column;
	align-items: center;
	overflow-x: hidden;
	min-height: 100vh;
`;

const HeaderWrapper = styled.div`
	${({ theme }) => theme.flexColumnNoWrap}
	width: 100%;
	position: fixed;
	justify-content: space-between;
	z-index: 2;
`;

const BodyWrapper = styled.div<{ warningActive?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding-top: 40px;
	margin-top: ${({ warningActive }) => (warningActive ? '140px' : '100px')};
	align-items: center;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	z-index: 1;

	> * {
		max-width: 1200px;
	}

	@media (max-width: 1080px) {
		padding-top: 2rem;
		margin-top: 140px;
	}
`;

const Marginer = styled.div`
	margin-top: 5rem;
`;

const Hide1080 = styled.div`
	@media (max-width: 1080px) {
		display: none;
	}
`;

export default function App() {
	// pretend load buffer
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setTimeout(() => setLoading(false), 1300);
	}, []);

	const location = useLocation();
	const [, setActiveNetwork] = useActiveNetworkVersion();
	useEffect(() => {
		if (location.pathname === '/') {
			setActiveNetwork(BobaNetworkInfo);
		} else {
			SUPPORTED_NETWORK_VERSIONS.forEach((n) => {
				if (location.pathname.includes(n.route.toLocaleLowerCase())) {
					setActiveNetwork(n);
				}
			});
		}
	}, [location.pathname, setActiveNetwork]);

	// subgraph health
	const [subgraphStatus] = useSubgraphStatus();

	return (
		<Suspense fallback={null}>
			<Route component={DarkModeQueryParamReader} />
			{loading ? (
				<LocalLoader fill={true} />
			) : (
				<AppWrapper>
					<HeaderWrapper>
						<Hide1080>
							<TopBar />
						</Hide1080>
						<Header />
					</HeaderWrapper>
					{subgraphStatus.available === false ? (
						<AppWrapper>
							<BodyWrapper>
								<DarkGreyCard style={{ maxWidth: '340px' }}>
									{/* eslint-disable-next-line react/jsx-pascal-case */}
									<TYPE.label>
										The Graph hosted network which provides data for this site is temporarily experiencing issues. Check current
										status{' '}
										<ExternalLink href="https://thegraph.com/legacy-explorer/subgraph/ianlapham/uniswap-v3-subgraph">
											here.
										</ExternalLink>
									</TYPE.label>
								</DarkGreyCard>
							</BodyWrapper>
						</AppWrapper>
					) : (
						<BodyWrapper>
							<Popups />
							<Switch>
								<Route exact strict path="/:networkID?/treasury" component={Treasury} />
								<Route exact strict path="/:networkID?/gauges" component={GaugesOverview} />
								<Route exact strict path="/:networkID?/pools/:poolId" component={PoolPage} />
								<Route exact strict path="/:networkID?/pools" component={PoolsOverview} />
								<Route exact strict path="/:networkID?/tokens/:address" component={RedirectInvalidToken} />
								<Route exact strict path="/:networkID?/tokens" component={TokensOverview} />
								<Route exact strict path="/:networkID?/fees" component={ProtocolFees} />
								<Route exact path="/:networkID?" component={Protocol} />
							</Switch>
							<Marginer />
						</BodyWrapper>
					)}
				</AppWrapper>
			)}
		</Suspense>
	);
}
