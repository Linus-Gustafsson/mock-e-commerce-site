using Microsoft.AspNetCore.Http.HttpResults;
using MockEcommerce.Api.Models;
using MockEcommerce.Api.Services;

namespace MockEcommerce.Api.Endpoints;

/// <summary>
/// Maps shopping cart endpoints under <c>/api/cart</c>.
/// </summary>
public static class CartEndpoints
{
    /// <summary>Registers cart-related routes on the given endpoint route builder.</summary>
    public static void MapCartEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("api/cart")
            .WithTags("Cart");

        group.MapGet("/", GetCart)
            .WithName("GetCart")
            .WithSummary("Returns all items currently in the cart.");

        group.MapPost("/", AddToCart)
            .WithName("AddToCart")
            .WithSummary("Adds a product to the cart or increments quantity if already present.");

        group.MapPut("/{productId:int}", UpdateCartItem)
            .WithName("UpdateCartItem")
            .WithSummary("Sets the quantity of a cart item to the specified absolute value.");

        group.MapDelete("/{productId:int}", RemoveFromCart)
            .WithName("RemoveFromCart")
            .WithSummary("Removes a single product from the cart by its product ID.");

        group.MapDelete("/", ClearCart)
            .WithName("ClearCart")
            .WithSummary("Removes all items from the cart.");
    }

    /// <summary>Returns all items currently in the cart.</summary>
    internal static Ok<IEnumerable<CartItem>> GetCart(ICartService cartService)
    {
        return TypedResults.Ok(cartService.GetAll());
    }

    /// <summary>Adds a product to the cart or increments quantity if already present.</summary>
    internal static Results<Created<CartItem>, Ok<CartItem>, NotFound<string>, ValidationProblem> AddToCart(
        AddToCartRequest request,
        IProductService productService,
        ICartService cartService)
    {
        if (request.Quantity < 1)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["quantity"] = ["Quantity must be at least 1."]
            });
        }

        var product = productService.GetById(request.ProductId);
        if (product is null)
            return TypedResults.NotFound($"Product {request.ProductId} not found.");

        var existing = cartService.GetByProductId(request.ProductId);
        int newTotal = (existing?.Quantity ?? 0) + request.Quantity;
        if (newTotal > 5)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["quantity"] = ["Cannot exceed the maximum quantity of 5 for this product."]
            });
        }

        var item = cartService.Add(new CartItem
        {
            ProductId = product.Id,
            ProductName = product.Name,
            UnitPrice = product.Price,
            Quantity = request.Quantity
        });

        if (existing is null)
            return TypedResults.Created($"/api/cart/{item.ProductId}", item);

        return TypedResults.Ok(item);
    }

    /// <summary>Removes a single product from the cart by its product ID.</summary>
    internal static Results<NoContent, NotFound> RemoveFromCart(int productId, ICartService cartService)
    {
        return cartService.Remove(productId) ? TypedResults.NoContent() : TypedResults.NotFound();
    }

    /// <summary>Removes all items from the cart.</summary>
    internal static NoContent ClearCart(ICartService cartService)
    {
        cartService.Clear();
        return TypedResults.NoContent();
    }

    /// <summary>Sets the quantity of a cart item to the specified absolute value.</summary>
    internal static Results<Ok<CartItem>, NotFound, ValidationProblem> UpdateCartItem(
        int productId,
        UpdateCartRequest request,
        ICartService cartService)
    {
        if (request.Quantity < 1 || request.Quantity > 5)
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["quantity"] = ["Quantity must be between 1 and 5."]
            });
        }

        var existing = cartService.GetByProductId(productId);
        if (existing is null)
            return TypedResults.NotFound();

        var updated = cartService.Update(productId, request.Quantity);
        return TypedResults.Ok(updated);
    }
}

/// <summary>Request body for adding a product to the cart.</summary>
public record AddToCartRequest(int ProductId, int Quantity);

/// <summary>Request body for updating a cart item's quantity to an absolute value.</summary>
public record UpdateCartRequest(int Quantity);
