using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MockEcommerce.Api.Models;

namespace MockEcommerce.Api.Tests.Endpoints;

public class CartEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CartEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    private async Task ClearCartAsync() => await _client.DeleteAsync("/api/cart");

    [Fact]
    public async Task GetCart_ReturnsOkWithEmptyList()
    {
        await ClearCartAsync();

        var response = await _client.GetAsync("/api/cart");

        response.EnsureSuccessStatusCode();
        var items = await response.Content.ReadFromJsonAsync<List<CartItem>>();
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    [Fact]
    public async Task AddToCart_NewProduct_ReturnsCreatedWithCartItem()
    {
        await ClearCartAsync();

        var response = await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItem>();
        Assert.NotNull(item);
        Assert.Equal(1, item.ProductId);
        Assert.Equal(1, item.Quantity);
    }

    [Fact]
    public async Task AddToCart_ExistingProduct_ReturnsOkWithIncrementedQuantity()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItem>();
        Assert.NotNull(item);
        Assert.Equal(2, item.Quantity);
    }

    [Fact]
    public async Task AddToCart_WouldExceedMaxQuantity_ReturnsBadRequest()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 5 });

        var response = await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AddToCart_UnknownProduct_ReturnsNotFound()
    {
        await ClearCartAsync();

        var response = await _client.PostAsJsonAsync("/api/cart", new { productId = 9999, quantity = 1 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task AddToCart_NegativeQuantity_ReturnsBadRequest()
    {
        await ClearCartAsync();

        var response = await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = -1 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RemoveFromCart_ExistingItem_ReturnsNoContent()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.DeleteAsync("/api/cart/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task RemoveFromCart_ItemNotInCart_ReturnsNotFound()
    {
        await ClearCartAsync();

        var response = await _client.DeleteAsync("/api/cart/1");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ClearCart_ReturnsNoContentAndEmptiesCart()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.DeleteAsync("/api/cart");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var cartResponse = await _client.GetAsync("/api/cart");
        var items = await cartResponse.Content.ReadFromJsonAsync<List<CartItem>>();
        Assert.Empty(items!);
    }

    [Fact]
    public async Task UpdateCartItem_ExistingItem_ReturnsOkWithNewQuantity()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.PutAsJsonAsync("/api/cart/1", new { quantity = 3 });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = await response.Content.ReadFromJsonAsync<CartItem>();
        Assert.NotNull(item);
        Assert.Equal(3, item.Quantity);
    }

    [Fact]
    public async Task UpdateCartItem_ItemNotInCart_ReturnsNotFound()
    {
        await ClearCartAsync();

        var response = await _client.PutAsJsonAsync("/api/cart/1", new { quantity = 2 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_QuantityAboveMax_ReturnsBadRequest()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.PutAsJsonAsync("/api/cart/1", new { quantity = 6 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCartItem_ZeroQuantity_ReturnsBadRequest()
    {
        await ClearCartAsync();
        await _client.PostAsJsonAsync("/api/cart", new { productId = 1, quantity = 1 });

        var response = await _client.PutAsJsonAsync("/api/cart/1", new { quantity = 0 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
