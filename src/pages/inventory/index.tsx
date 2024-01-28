import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import MetaTags from "~/components/MetaTags";
import { SearchInventory } from "~/components/inventory/SearchInventory";

const InventoryExplorer = () => {
  // const router = useRouter();
  // const { account } = router.query;

  return (
    <>
      <MetaTags title="Clayno.club | Inventory Search" />
      <Layout>
        <section className="flex flex-col items-center justify-center gap-y-8 md:container md:p-2">
          <SearchInventory />
        </section>
      </Layout>
    </>
  );
};

export default InventoryExplorer;
