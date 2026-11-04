
using Microsoft.EntityFrameworkCore;
using UserDirectory.API.Models;

namespace UserDirectory.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.Property(user => user.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.City)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.State)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.Pincode)
                .IsRequired()
                .HasMaxLength(10);
        });
    }
}
