import { SearchInput } from "./search-input";
import { SearchResults } from "./search-result";

export default function Search() {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Mutual Fund Search</h1>
        <SearchInput />
        <SearchResults />
      </main>
    )
  }
  
  