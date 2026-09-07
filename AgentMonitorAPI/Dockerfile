FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

EXPOSE 8080

ENV ASPNETCORE_HTTP_PORTS=8080


FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release

WORKDIR /src

COPY ["AgentMonitorAPI/AgentMonitorAPI.csproj", "AgentMonitorAPI/"]
COPY ["AgentMonitor.Shared/AgentMonitor.Shared.csproj", "AgentMonitor.Shared/"]

RUN dotnet restore "AgentMonitorAPI/AgentMonitorAPI.csproj"

COPY . .

WORKDIR "/src/AgentMonitorAPI"

RUN dotnet build "AgentMonitorAPI.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build


FROM build AS publish
ARG BUILD_CONFIGURATION=Release

RUN dotnet publish "AgentMonitorAPI.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false


FROM base AS final
WORKDIR /app

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "AgentMonitorAPI.dll"]