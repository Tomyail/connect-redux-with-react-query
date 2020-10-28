import {
  QueryConfig,
  QueryFunction,
  QueryKey,
  QueryResult,
  useQuery,
} from 'react-query';
import { useSelector } from 'react-redux';
import React from 'react';

// Keep Your Component Pure & Stupid

/**
 * 将组件组要的数据通过 api 请求获取的高阶组件
 * @param queryFn 请求参数函数
 * @param apiFn 具体的异步请求
 * @param selector 请求获取成功后调用的 redux 的 mapStateToProps
 * @param renderFactory loading 工厂函数
 * @param config react-query 和 redux action 配置
 */
export const connectReduxWithQuery = <S, TApiResult = unknown>(
  queryFn: (state: S) => QueryKey,
  apiFn: QueryFunction<TApiResult>,
  selector: (state: S, data: TApiResult) => any,
  renderFactory: (
    Comp,
    queryResult: QueryResult<TApiResult>,
    selector: (state: S, data) => any,
    state: S,
    config: any
  ) => JSX.Element,
  config?: {
    actions: Record<string, (...args) => any>;
    queryConfig?: QueryConfig<any>;
  }
) => {
  return (Comp) => {
    return () => {
      const store = useSelector<S, S>((state) => state);
      const query = queryFn(store);
      const queryResult = useQuery(query, apiFn, config?.queryConfig);
      return renderFactory(Comp, queryResult, selector, store, config);
    };
  };
};

//统一的 loading 和报错
export const createGlobalLoadingAndError = (LoadingComp, ErrorComp) => (
  Comp,
  queryResult,
  selector,
  state,
  config
) => {
  if (queryResult.isLoading) return React.createElement(LoadingComp);
  if (queryResult.error) return React.createElement(ErrorComp);
  const props = selector(state, queryResult.data);
  return React.createElement(Comp, { ...props, ...config?.actions });
};
