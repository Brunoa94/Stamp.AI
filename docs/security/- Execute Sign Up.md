- Execute Sign Up
- Execute Login and Logout
- Navigate to catalog, check if the catalog match the database, click it and see the products being showed
- Navigate to cart, it should display the cart items if they exist, if not should show an empty state
- On cart try two separate flows:
- with a single product
- with 3 products
- with 3 products but just three selected

From there you should create an end to end test for each specific scenario until the order confirmation. In the end always test the different payment methods. During the entire process validate the prices displayed and sent. Verify if the products match and if they match the expected scenario.

- In the homepage and navbar test all the navigation links in order to grant that they navigate to the expected scenarios

- Now in the Stamp page and process you should validate each step, and confirm it clicking to the next state and checking the state.
  1. Begin customization should navigate to the Upload Image step
  2. On the Upload Image:
     1. Clicking on the Upload Image should open a modal to upload the file. Once a file is uploaded it should be showed on the image container. When the image is uploaded the button must change from Skip Upload to Next step.
     2. Removing an image must back to the initial state on the button and in the upload image container.
     3. Clicking Skip Upload must move to the next step.
  3. Describe your design
     1. If the user writes a prompt the prompt must update the state.
     2. If the user skips the step it should move to the next step of generating an image
     3. If the user writes a prompt and click to Stamp it step that prompt must be enhances and should call the api to generate an image based on the image
     4. If the user clicks in one of the filters each type of filter must be reflected on the prompt sent
     5. If no filter is selected nothing should be added to the sent prompt
     6. Removing the background must include that in the prompt.
     7. The preservation slider must send the selected value
     8. If a Stamp is generated a coin must be deducted from the user account
     9. Clicking on the back step button it should back to the previous step
     10. If proceeding without generate a new, on the next step it should verify if values exist on the local storage. If yes, they must show all the stored image on the "Your creation" step. The image uploaded on the first step must also be one of the options. If it doesnt contain generated images the next step must be to be customize the product.
  4.
