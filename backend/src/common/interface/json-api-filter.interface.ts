export type FilterOperator =
    | 'eq'         // Exact (=)
    | 'like'       // Partial match (ILIKE)
    | 'gt'         // Greater than (>)
    | 'lt'         // Less than (<)
    | 'gte'        // Greater than or equal to (>=)
    | 'lte'        // Less than or equal to (<=)
    | 'orLike'     // Combined search: Search for the same term in multiple columns using “OR”
    | 'orEq'       // Exact joint search
    | 'splitLike'  // Split search: Splits the string by a character and performs a partial search for each segment in its respective column
    | 'splitEq';   // Exact separate search
º
export interface JsonApiFilter {
    fields: string[];
    operator: FilterOperator;
    value: string;
}