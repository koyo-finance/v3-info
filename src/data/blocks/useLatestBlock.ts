import { useGetLatestBlockQuery } from '../../apollo/generated/graphql-codegen-generated';
import { bobaBlockClient } from '../../apollo/client';

export function useLatestBlock(): { blockNumber?: number; loading: boolean } {
	const { data, loading } = useGetLatestBlockQuery({ pollInterval: 10000, client: bobaBlockClient });

	return {
		blockNumber: data?.blocks[0]?.number ? parseFloat(data?.blocks[0]?.number) : undefined,
		loading
	};
}
