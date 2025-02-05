<script lang="ts">
import ImageApiClient from "$features/images/api";
import { apiClientOptions } from "$lib/api-builder";

const imageClient = new ImageApiClient(apiClientOptions);

(async () => {
  const temp = await imageClient.getImageById(
    "0964cf80-c7f2-11ef-8a8e-ff84e6ecd36a",
  );
  console.info(temp);
})();
</script>
