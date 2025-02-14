<script lang="ts">
import { ImageApiClient } from "$features/images/api";
import { apiClientOptions } from "$lib/api-builder";
import { Log } from "$lib/logger";

const imageClient = new ImageApiClient(apiClientOptions);

(async () => {
  const temp = await imageClient.getById(
    "0964cf80-c7f2-11ef-8a8e-ff84e6ecd36a",
  );
  Log.info(temp);
})();
</script>
